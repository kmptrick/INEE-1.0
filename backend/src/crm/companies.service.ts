import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, ClientType } from './dto/company.dto';
import { AuditService } from '../audit/audit.service';

function buildName(dto: CreateCompanyDto): string {
  if (dto.clientType === ClientType.PARTICULIER) {
    return [dto.prenom, dto.nom].filter(Boolean).join(' ') || 'Client';
  }
  return dto.denomination || 'Client';
}

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private async nextReference(): Promise<string> {
    const count = await this.prisma.company.count();
    return `Cli - ${String(count + 1).padStart(3, '0')}`;
  }

  findAll(search?: string) {
    return this.prisma.company.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      include: { _count: { select: { contacts: true, deals: true } } },
      orderBy: [{ name: 'asc' }] as any,
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

  async create(dto: CreateCompanyDto, userId?: string) {
    const name = buildName(dto);
    const reference = await this.nextReference();
    const company = await this.prisma.company.create({ data: { ...dto, name, reference } as any });
    await this.audit.log({ entityType: 'Company', entityId: company.id, userId, action: 'Client créé', details: `${name} · ${dto.clientType}` });
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto, userId?: string) {
    const before = await this.findOne(id);
    const name = buildName(dto);
    const company = await this.prisma.company.update({ where: { id }, data: { ...dto, name } });
    const changes: string[] = [];
    if (name !== before.name) changes.push(`Nom : "${before.name}" → "${name}"`);
    if (dto.email && dto.email !== before.email) changes.push(`Email : ${dto.email}`);
    if (dto.vatNumber && dto.vatNumber !== before.vatNumber) changes.push(`N° TVA : ${dto.vatNumber}`);
    await this.audit.log({ entityType: 'Company', entityId: id, userId, action: 'Client modifié', details: changes.join(' | ') || undefined });
    return company;
  }

  async setActive(id: string, isActive: boolean, userId?: string) {
    await this.findOne(id);
    if (!isActive) {
      await (this.prisma as any).subscription.updateMany({ where: { companyId: id }, data: { status: 'INACTIVE' } });
    }
    const company = await this.prisma.company.update({ where: { id }, data: { isActive } as any });
    await this.audit.log({ entityType: 'Company', entityId: id, userId, action: isActive ? 'Client réactivé' : 'Client désactivé' });
    return company;
  }

  async remove(id: string) {
    await this.findOne(id);
    const links = await this.prisma.company.findUnique({
      where: { id },
      include: { _count: { select: { deals: true, invoices: true, quotes: true, commissions: true, projects: true } } },
    });
    const counts = links!._count;
    const total = counts.deals + counts.invoices + counts.quotes + counts.commissions + counts.projects;
    if (total > 0) {
      throw new BadRequestException(
        `Ce client est lié à ${total} enregistrement(s). Utilisez la désactivation à la place.`
      );
    }
    return this.prisma.company.delete({ where: { id } });
  }
}
