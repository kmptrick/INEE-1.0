import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditNoteDto, UpdateCreditNoteDto } from './dto/credit-note.dto';

const VAT_LU = 17;

const CN_INCLUDE = {
  invoice: { select: { id: true, number: true } },
  company: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  lines: true,
};

@Injectable()
export class CreditNotesService {
  constructor(private prisma: PrismaService) {}

  private async nextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await (this.prisma as any).creditNote.count();
    return `NC / ${year} - ${String(count + 1).padStart(3, '0')}`;
  }

  private calcTotals(lines: { quantity: number; unitPrice: number }[], vatRate = VAT_LU) {
    const subtotal = lines.reduce((sum, l) => sum + Math.round(l.quantity * l.unitPrice * 100) / 100, 0);
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    return { subtotal, vatRate, vatAmount, total };
  }

  findAll(status?: string) {
    return (this.prisma as any).creditNote.findMany({
      where: status ? { status: status as any } : undefined,
      include: CN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cn = await (this.prisma as any).creditNote.findUnique({ where: { id }, include: CN_INCLUDE });
    if (!cn) throw new NotFoundException('Credit note not found');
    return cn;
  }

  async create(data: CreateCreditNoteDto, userId: string) {
    const { lines, vatRate = VAT_LU, ...rest } = data;
    const totals = this.calcTotals(lines, vatRate);
    const number = await this.nextNumber();

    // inherit companyId from invoice if not provided
    let companyId = rest.companyId;
    if (!companyId) {
      const inv = await this.prisma.invoice.findUnique({ where: { id: rest.invoiceId }, select: { companyId: true } });
      companyId = inv?.companyId ?? undefined;
    }

    return (this.prisma as any).creditNote.create({
      data: {
        ...rest,
        companyId,
        number,
        createdById: userId,
        ...totals,
        lines: {
          create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })),
        },
      },
      include: CN_INCLUDE,
    });
  }

  async update(id: string, data: UpdateCreditNoteDto) {
    await this.findOne(id);
    const { lines, vatRate = VAT_LU, ...rest } = data;

    const updateData: any = { ...rest };
    if (lines) {
      const totals = this.calcTotals(lines, vatRate);
      Object.assign(updateData, totals, {
        lines: {
          deleteMany: {},
          create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })),
        },
      });
    }

    return (this.prisma as any).creditNote.update({ where: { id }, data: updateData, include: CN_INCLUDE });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma as any).creditNote.delete({ where: { id } });
  }
}
