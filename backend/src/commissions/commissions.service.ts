import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.commission.count();
    return `Ref - ${year} - ${String(count + 1).padStart(3, '0')}`;
  }

  private calcAmount(dealValue: number, rate: number): number {
    return Math.round((dealValue * rate / 100) * 100) / 100;
  }

  findAll(status?: string) {
    return this.prisma.commission.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        company: { select: { id: true, name: true } },
        broker: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id },
      include: {
        company: true,
        broker: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!commission) throw new NotFoundException('Commission not found');
    return commission;
  }

  async create(data: CreateCommissionDto, userId?: string) {
    const commissionAmount = this.calcAmount(data.dealValue, data.commissionRate);
    const reference = await this.generateReference();
    const comm = await this.prisma.commission.create({
      data: { ...data, commissionAmount, reference },
      include: { company: true },
    });
    await this.audit.log({ entityType: 'Commission', entityId: comm.id, userId, action: 'Commission créée', details: `Apporteur : ${comm.brokerName} · Montant : ${commissionAmount} €` });
    return comm;
  }

  async update(id: string, data: UpdateCommissionDto, userId?: string) {
    const before = await this.findOne(id);
    const commissionAmount = (data.dealValue && data.commissionRate)
      ? this.calcAmount(data.dealValue, data.commissionRate)
      : before.commissionAmount;
    const comm = await this.prisma.commission.update({
      where: { id },
      data: { ...data, commissionAmount },
      include: { company: true },
    });
    const action = data.status && data.status !== before.status
      ? `Statut : ${before.status} → ${data.status}`
      : 'Commission modifiée';
    await this.audit.log({ entityType: 'Commission', entityId: id, userId, action });
    return comm;
  }

  async remove(id: string, userId?: string) {
    const comm = await this.findOne(id);
    await this.audit.log({ entityType: 'Commission', entityId: id, userId, action: `Supprimée (${comm.reference})` });
    return this.prisma.commission.delete({ where: { id } });
  }

  async getStats() {
    const [byStatus, total, pending, paid] = await Promise.all([
      this.prisma.commission.groupBy({
        by: ['status'],
        _sum: { commissionAmount: true, dealValue: true },
        _count: true,
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true, dealValue: true },
        _count: true,
      }),
      this.prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: { commissionAmount: true },
      }),
      this.prisma.commission.aggregate({
        where: { status: 'PAID' },
        _sum: { commissionAmount: true },
      }),
    ]);

    return {
      byStatus,
      totalDeals: total._sum.dealValue ?? 0,
      totalCommissions: total._sum.commissionAmount ?? 0,
      totalCount: total._count,
      pendingAmount: pending._sum.commissionAmount ?? 0,
      paidAmount: paid._sum.commissionAmount ?? 0,
    };
  }
}
