import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  findAll(userId?: string, start?: string, end?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (start || end) {
      where.startDate = {};
      if (start) where.startDate.gte = new Date(start);
      if (end) where.startDate.lte = new Date(end);
    }
    return this.prisma.calendarEvent.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.calendarEvent.create({ data: { ...data, userId } });
  }

  async update(id: string, userId: string, role: string, data: any) {
    const ev = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException('Événement introuvable');
    if (ev.userId !== userId && role !== 'ADMIN') throw new ForbiddenException('Non autorisé');
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  async remove(id: string, userId: string, role: string) {
    const ev = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException('Événement introuvable');
    if (ev.userId !== userId && role !== 'ADMIN') throw new ForbiddenException('Non autorisé');
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
