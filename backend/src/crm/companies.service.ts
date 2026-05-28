import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, ClientType } from './dto/company.dto';

function buildName(dto: CreateCompanyDto): string {
  if (dto.clientType === ClientType.PARTICULIER) {
    return [dto.prenom, dto.nom].filter(Boolean).join(' ') || 'Client';
  }
  return dto.denomination || 'Client';
}

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.company.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      include: { _count: { select: { contacts: true, deals: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { contacts: true, deals: { include: { stage: true } } },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  create(dto: CreateCompanyDto) {
    const name = buildName(dto);
    return this.prisma.company.create({ data: { ...dto, name } });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    const name = buildName(dto);
    return this.prisma.company.update({ where: { id }, data: { ...dto, name } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
