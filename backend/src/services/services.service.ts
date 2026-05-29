import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, categorie?: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        ...(categorie ? { categorie } : {}),
        ...(search ? {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { idPrestation: { contains: search, mode: 'insensitive' } },
            { categorie: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: [{ categorie: 'asc' }, { idPrestation: 'asc' }],
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
    const rows = await this.prisma.service.findMany({
      where: { isActive: true },
      select: { categorie: true },
      distinct: ['categorie'],
      orderBy: { categorie: 'asc' },
    });
    return rows.map(r => r.categorie);
  }

  async create(dto: CreateServiceDto) {
    const exists = await this.prisma.service.findUnique({ where: { idPrestation: dto.idPrestation } });
    if (exists) throw new ConflictException(`L'ID prestation ${dto.idPrestation} existe déjà`);
    return this.prisma.service.create({ data: dto });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    if (dto.idPrestation) {
      const conflict = await this.prisma.service.findUnique({ where: { idPrestation: dto.idPrestation } });
      if (conflict && conflict.id !== id) throw new ConflictException('ID prestation déjà utilisé');
    }
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const svc = await this.prisma.service.findUnique({
      where: { id },
      include: { _count: { select: { quoteLines: true, invoiceLines: true } } },
    });
    if (!svc) throw new NotFoundException('Service introuvable');
    const total = svc._count.quoteLines + svc._count.invoiceLines;
    if (total > 0) {
      // Linked → soft deactivate only
      return this.prisma.service.update({ where: { id }, data: { isActive: false } });
    }
    // No links → true delete
    return this.prisma.service.delete({ where: { id } });
  }
}
