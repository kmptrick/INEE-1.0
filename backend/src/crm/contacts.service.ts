import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  private async nextReference(): Promise<string> {
    const count = await this.prisma.contact.count();
    return `Cont / ${String(count + 1).padStart(3, '0')}`;
  }

  findAll(search?: string, companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.contact.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: { company: { select: { id: true, name: true } } },
      orderBy: [{ lastName: 'asc' }] as any,
    });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: { company: true, deals: { include: { stage: true } } },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async create(data: CreateContactDto) {
    const reference = await this.nextReference();
    return this.prisma.contact.create({ data: { ...data, reference } as any });
  }

  async update(id: string, data: UpdateContactDto) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data });
  }

  async setActive(id: string, isActive: boolean) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data: { isActive } as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    const links = await this.prisma.contact.findUnique({
      where: { id },
      include: { _count: { select: { deals: true } } },
    });
    if (links!._count.deals > 0) {
      throw new BadRequestException(
        `Ce contact est lié à ${links!._count.deals} affaire(s). Utilisez la désactivation à la place.`
      );
    }
    return this.prisma.contact.delete({ where: { id } });
  }
}
