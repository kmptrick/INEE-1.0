import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async findAll(search?: string, categorie?: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        ...(categorie ? { categorie } : {}),
        ...(search ? { OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { idPrestation: { contains: search, mode: 'insensitive' } },
          { categorie: { contains: search, mode: 'insensitive' } },
        ] } : {}),
      },
      orderBy: [{ idPrestation: 'asc' }],
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service introuvable');
    return service;
  }

  async findByIdPrestation(idPrestation: string) {
    const service = await this.prisma.service.findUnique({ where: { idPrestation } });
    if (!service) throw new NotFoundException('Prestation introuvable');
    return service;
  }

  async categories() {
    const rows = await this.prisma.service.findMany({ where: { isActive: true }, select: { categorie: true }, distinct: ['categorie'], orderBy: { categorie: 'asc' } });
    return rows.map(r => r.categorie);
  }

  async create(dto: CreateServiceDto, userId?: string) {
    const exists = await this.prisma.service.findUnique({ where: { idPrestation: dto.idPrestation } });
    if (exists) throw new ConflictException(`L'ID prestation ${dto.idPrestation} existe déjà`);
    const svc = await this.prisma.service.create({ data: dto });
    await this.audit.log({ entityType: 'Service', entityId: svc.id, userId, action: 'Prestation créée', details: `${dto.idPrestation} — ${dto.description} · ${dto.prixHT} €` });
    return svc;
  }

  async update(id: string, dto: UpdateServiceDto, userId?: string) {
    const before = await this.findOne(id);
    if (dto.idPrestation) {
      const conflict = await this.prisma.service.findUnique({ where: { idPrestation: dto.idPrestation } });
      if (conflict && conflict.id !== id) throw new ConflictException('ID prestation déjà utilisé');
    }
    const svc = await this.prisma.service.update({ where: { id }, data: dto });
    const changes: string[] = [];
    if (dto.description && dto.description !== before.description) changes.push(`Description : "${before.description}" → "${dto.description}"`);
    if (dto.prixHT !== undefined && dto.prixHT !== before.prixHT) changes.push(`Prix HT : ${before.prixHT} € → ${dto.prixHT} €`);
    if (dto.vatRate !== undefined && dto.vatRate !== before.vatRate) changes.push(`TVA : ${before.vatRate}% → ${dto.vatRate}%`);
    await this.audit.log({ entityType: 'Service', entityId: id, userId, action: 'Prestation modifiée', details: changes.join(' | ') || undefined });
    return svc;
  }

  async remove(id: string, userId?: string) {
    const svc = await this.prisma.service.findUnique({ where: { id }, include: { _count: { select: { quoteLines: true, invoiceLines: true } } } });
    if (!svc) throw new NotFoundException('Service introuvable');
    const total = svc._count.quoteLines + svc._count.invoiceLines;
    if (total > 0) {
      await this.audit.log({ entityType: 'Service', entityId: id, userId, action: 'Prestation désactivée', details: `Liée à ${total} ligne(s)` });
      return this.prisma.service.update({ where: { id }, data: { isActive: false } });
    }
    await this.audit.log({ entityType: 'Service', entityId: id, userId, action: 'Prestation supprimée', details: svc.idPrestation });
    return this.prisma.service.delete({ where: { id } });
  }
}
