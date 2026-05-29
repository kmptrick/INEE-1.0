import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return (this.prisma as any).leaveType.findMany({ orderBy: { name: 'asc' } });
  }

  async create(data: { name: string; color?: string; maxDaysPerYear?: number }) {
    return (this.prisma as any).leaveType.create({ data });
  }

  async update(id: string, data: { name?: string; color?: string; maxDaysPerYear?: number; isActive?: boolean }) {
    const existing = await (this.prisma as any).leaveType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Type de congé introuvable');
    return (this.prisma as any).leaveType.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await (this.prisma as any).leaveType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Type de congé introuvable');
    return (this.prisma as any).leaveType.delete({ where: { id } });
  }
}
