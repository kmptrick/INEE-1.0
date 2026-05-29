import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId?: string, status?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    return (this.prisma as any).leaveRequest.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true } }, leaveType: true },
      orderBy: { startDate: 'desc' },
    });
  }

  findMine(userId: string) {
    return (this.prisma as any).leaveRequest.findMany({
      where: { userId },
      include: { leaveType: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(userId: string, data: { leaveTypeId: string; startDate: string; endDate: string; daysCount: number; notes?: string }) {
    return (this.prisma as any).leaveRequest.create({
      data: { ...data, userId },
      include: { leaveType: true },
    });
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const req = await (this.prisma as any).leaveRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Demande introuvable');
    return (this.prisma as any).leaveRequest.update({ where: { id }, data: { status } });
  }

  async remove(id: string, requesterId: string, requesterRole: string) {
    const req = await (this.prisma as any).leaveRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Demande introuvable');
    if (req.userId !== requesterId && requesterRole !== 'ADMIN') throw new ForbiddenException('Non autorisé');
    return (this.prisma as any).leaveRequest.delete({ where: { id } });
  }
}
