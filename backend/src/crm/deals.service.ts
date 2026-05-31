import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto, UpdateDealDto } from './dto/deal.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private async nextReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.deal.count();
    return `Aff / ${year} - ${String(count + 1).padStart(3, '0')}`;
  }

  findAll(status?: string) {
    return this.prisma.deal.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        company: true,
        stage: { include: { pipeline: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async create(data: CreateDealDto, userId: string) {
    const reference = await this.nextReference();
    const deal = await this.prisma.deal.create({
      data: { ...data, assignedToId: userId, reference } as any,
      include: { contact: true, company: true, stage: true },
    });
    await this.audit.log({ entityType: 'Deal', entityId: deal.id, userId, action: 'Affaire créée', details: `${deal.title} · ${deal.value} ${deal.currency}` });
    return deal;
  }

  async update(id: string, data: UpdateDealDto, userId?: string) {
    const before = await this.findOne(id);
    const deal = await this.prisma.deal.update({ where: { id }, data, include: { contact: true, company: true, stage: true } });
    const action = (data as any).status && (data as any).status !== before.status
      ? `Statut : ${before.status} → ${(data as any).status}`
      : 'Affaire modifiée';
    await this.audit.log({ entityType: 'Deal', entityId: id, userId, action });
    return deal;
  }

  async remove(id: string, userId?: string) {
    const deal = await this.findOne(id);
    await this.audit.log({ entityType: 'Deal', entityId: id, userId, action: `Affaire supprimée : ${deal.title}` });
    return this.prisma.deal.delete({ where: { id } });
  }

  async getPipelineStats() {
    const deals = await this.prisma.deal.groupBy({
      by: ['status'],
      _sum: { value: true },
      _count: true,
    });
    return deals;
  }
}
