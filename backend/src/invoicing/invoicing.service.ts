import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, CreateInvoiceFromQuoteDto } from './dto/invoice.dto';

const VAT_LU = 17;

@Injectable()
export class InvoicingService {
  constructor(private prisma: PrismaService) {}

  // ─── Numérotation ──────────────────────────────────────────────────────────

  private async nextQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count();
    return `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async nextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    return `FAC-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // ─── Calcul TVA ────────────────────────────────────────────────────────────

  private calcTotals(lines: { quantity: number; unitPrice: number }[], vatRate = VAT_LU) {
    const subtotal = lines.reduce((sum, l) => sum + Math.round(l.quantity * l.unitPrice * 100) / 100, 0);
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    return { subtotal, vatRate, vatAmount, total };
  }

  // ─── DEVIS ─────────────────────────────────────────────────────────────────

  findAllQuotes(status?: string) {
    return this.prisma.quote.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        company: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneQuote(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { company: true, createdBy: { select: { id: true, firstName: true, lastName: true } }, lines: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async createQuote(data: CreateQuoteDto, userId: string) {
    const { lines, vatRate = VAT_LU, ...rest } = data;
    const totals = this.calcTotals(lines, vatRate);
    const number = await this.nextQuoteNumber();

    return this.prisma.quote.create({
      data: {
        ...rest,
        number,
        createdById: userId,
        ...totals,
        lines: {
          create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })),
        },
      },
      include: { company: true, lines: true },
    });
  }

  async updateQuote(id: string, data: UpdateQuoteDto) {
    await this.findOneQuote(id);
    const { lines, vatRate = VAT_LU, ...rest } = data;
    const totals = this.calcTotals(lines, vatRate);

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...rest,
        ...totals,
        lines: {
          deleteMany: {},
          create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })),
        },
      } as any,
      include: { company: true, lines: true },
    });
  }

  async removeQuote(id: string) {
    await this.findOneQuote(id);
    return this.prisma.quote.delete({ where: { id } });
  }

  // ─── FACTURES ──────────────────────────────────────────────────────────────

  findAllInvoices(status?: string) {
    return this.prisma.invoice.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        company: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { company: true, createdBy: { select: { id: true, firstName: true, lastName: true } }, lines: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async createInvoice(data: CreateInvoiceDto, userId: string) {
    const { lines, vatRate = VAT_LU, ...rest } = data;
    const totals = this.calcTotals(lines, vatRate);
    const number = await this.nextInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        ...rest,
        number,
        createdById: userId,
        ...totals,
        lines: {
          create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })),
        },
      },
      include: { company: true, lines: true },
    });
  }

  async createInvoiceFromQuote(data: CreateInvoiceFromQuoteDto, userId: string) {
    const quote = await this.findOneQuote(data.quoteId);
    if (quote.status !== 'ACCEPTED') throw new BadRequestException('Quote must be accepted before converting to invoice');

    const number = await this.nextInvoiceNumber();
    return this.prisma.invoice.create({
      data: {
        number,
        companyId: quote.companyId,
        createdById: userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        total: quote.total,
        notes: quote.notes,
        lines: {
          create: quote.lines.map(l => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            total: l.total,
          })),
        },
      },
      include: { company: true, lines: true },
    });
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto) {
    await this.findOneInvoice(id);
    const { lines, vatRate = VAT_LU, paidAmount, status, ...rest } = data;
    const totals = this.calcTotals(lines, vatRate);

    const updateData: any = { ...rest, ...totals };
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (status) updateData.status = status;

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateData,
        lines: {
          deleteMany: {},
          create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })),
        },
      },
      include: { company: true, lines: true },
    });
  }

  async removeInvoice(id: string) {
    await this.findOneInvoice(id);
    return this.prisma.invoice.delete({ where: { id } });
  }

  // ─── STATS ─────────────────────────────────────────────────────────────────

  async getStats() {
    const [invoiceStats, quoteStats, overdue] = await Promise.all([
      this.prisma.invoice.groupBy({
        by: ['status'],
        _sum: { total: true, paidAmount: true },
        _count: true,
      }),
      this.prisma.quote.groupBy({
        by: ['status'],
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.invoice.findMany({
        where: { status: 'SENT', dueDate: { lt: new Date() } },
        select: { id: true, number: true, total: true, dueDate: true, company: { select: { name: true } } },
      }),
    ]);

    return { invoiceStats, quoteStats, overdueInvoices: overdue };
  }
}
