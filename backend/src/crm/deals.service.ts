import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto, UpdateDealDto } from './dto/deal.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

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

  create(data: CreateDealDto, userId: string) {
    return this.prisma.deal.create({
      data: { ...data, assignedToId: userId },
      include: { contact: true, company: true, stage: true },
    });
  }

  async update(id: string, data: UpdateDealDto) {
    await this.findOne(id);
    return this.prisma.deal.update({
      where: { id },
      data,
      include: { contact: true, company: true, stage: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
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
