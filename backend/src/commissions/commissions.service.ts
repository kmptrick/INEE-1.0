import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.commission.count();
    return `Ref / ${year} - ${String(count + 1).padStart(3, '0')}`;
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

  async create(data: CreateCommissionDto) {
    const commissionAmount = this.calcAmount(data.dealValue, data.commissionRate);
    const reference = await this.generateReference();
    return this.prisma.commission.create({
      data: {
        ...data,
        commissionAmount,
        reference,
      },
      include: { company: true },
    });
  }

  async update(id: string, data: UpdateCommissionDto) {
    await this.findOne(id);
    const commissionAmount = this.calcAmount(data.dealValue, data.commissionRate);
    return this.prisma.commission.update({
      where: { id },
      data: { ...data, commissionAmount },
      include: { company: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
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
