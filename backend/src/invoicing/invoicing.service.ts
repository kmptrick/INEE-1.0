import { Injectable, NotFoundException, BadRequestException, MethodNotAllowedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, CreateInvoiceFromQuoteDto } from './dto/invoice.dto';

const VAT_LU = 17;
const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

@Injectable()
export class InvoicingService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  // ─── Numérotation ──────────────────────────────────────────────────────────

  private async nextQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count();
    return `Dev / ${year} - ${String(count + 1).padStart(3, '0')}`;
  }

  private async nextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    // Compter uniquement les factures qui ont déjà un numéro (comptabilisées)
    const count = await (this.prisma as any).invoice.count({ where: { number: { not: null } } });
    return `Fact / ${year} - ${String(count + 1).padStart(3, '0')}`;
  }

  // ─── Calcul TVA ────────────────────────────────────────────────────────────

  private calcTotals(lines: { quantity: number; unitPrice: number; discountRate?: number; lineVatRate?: number }[], defaultVatRate = VAT_LU) {
    let subtotal = 0;
    let vatAmount = 0;
    for (const l of lines) {
      const disc = l.discountRate ?? 0;
      const lineTotal = Math.round(l.quantity * l.unitPrice * (1 - disc / 100) * 100) / 100;
      subtotal += lineTotal;
      const vr = l.lineVatRate ?? defaultVatRate;
      vatAmount += Math.round(lineTotal * vr) / 100;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    vatAmount = Math.round(vatAmount * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    return { subtotal, vatRate: defaultVatRate, vatAmount, total };
  }

  private lineTotal(l: { quantity: number; unitPrice: number; discountRate?: number }): number {
    const disc = l.discountRate ?? 0;
    return Math.round(l.quantity * l.unitPrice * (1 - disc / 100) * 100) / 100;
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
          create: lines.map(l => ({ ...l, total: this.lineTotal(l) })),
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
          create: lines.map(l => ({ ...l, total: this.lineTotal(l) })),
        },
      } as any,
      include: { company: true, lines: true },
    });
  }

  async removeQuote(id: string) {
    throw new MethodNotAllowedException('Les devis ne peuvent pas être supprimés.');
  }

  private filterActiveRecipients(recipients: string[]): string[] {
    // This filters at the service level only when auto-building the list.
    // For explicit recipient arrays passed from frontend, we trust the frontend
    // to only include active contacts. Backend validation is a safety net.
    return recipients.filter(r => r && r.includes('@'));
  }

  async sendQuote(id: string, recipients: string[]) {
    const quote = await this.findOneQuote(id);
    const linesHtml = (quote.lines ?? []).map(l =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td></tr>`
    ).join('');
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
      <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
        <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
        <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
      </div>
      <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#C8803A;margin:0 0 4px">DEVIS ${quote.number}</h2>
        ${quote.company ? `<p style="color:#7A6050;margin:0 0 16px">Client : <strong style="color:#1A1008">${quote.company.name}</strong></p>` : ''}
        ${(quote as any).vatMention ? `<p style="background:#FFFBEB;border:1px solid #FDE68A;padding:8px 12px;border-radius:4px;font-size:12px;color:#92400E">${(quote as any).vatMention}</p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#F5EDE4"><th style="padding:8px 10px;text-align:left;font-size:12px;color:#7A6050">Description</th><th style="padding:8px 10px;text-align:center;font-size:12px;color:#7A6050">Qté</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Prix HT</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Total HT</th></tr></thead>
          <tbody>${linesHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:8px">
          <p style="margin:4px 0;color:#7A6050">HT : ${fmt(quote.subtotal)}</p>
          <p style="margin:4px 0;color:#7A6050">TVA ${quote.vatRate}% : ${fmt(quote.vatAmount)}</p>
          <p style="margin:8px 0;font-size:16px;font-weight:bold;background:#C8803A;color:#fff;display:inline-block;padding:6px 16px;border-radius:4px">Total TTC : ${fmt(quote.total)}</p>
        </div>
        ${quote.notes ? `<p style="margin-top:16px;color:#7A6050;font-size:13px"><em>${quote.notes}</em></p>` : ''}
      </div>
    </div>`;
    await this.mail.sendBilling({ to: recipients, subject: `Devis ${quote.number} — INEE`, html });
    return this.prisma.quote.update({ where: { id }, data: { status: 'SENT' }, include: { company: true, lines: true } });
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
    // Brouillon : pas de numéro assigné immédiatement

    return (this.prisma as any).invoice.create({
      data: {
        ...rest,
        createdById: userId,
        ...totals,
        number: null,
        lines: {
          create: lines.map(l => ({ ...l, total: this.lineTotal(l) })),
        },
      },
      include: { company: true, lines: true },
    });
  }

  async postInvoice(id: string) {
    const inv = await this.findOneInvoice(id);
    if ((inv as any).number) throw new BadRequestException('Cette facture est déjà comptabilisée.');
    const number = await this.nextInvoiceNumber();
    const now = new Date();
    return (this.prisma as any).invoice.update({
      where: { id },
      data: { number, issueDate: now },
      include: { company: true, lines: true },
    });
  }

  // ─── Récupération des destinataires autorisés ──────────────────────────────

  private async getCompanyRecipients(companyId: string | null): Promise<string[]> {
    if (!companyId) return [];
    const cts = await this.prisma.contact.findMany({
      where: { companyId, canReceiveInvoices: true, isActive: true, email: { not: null } } as any,
      select: { email: true },
    });
    return cts.map((c: any) => c.email).filter(Boolean);
  }

  // ─── Envoi automatique FACTURE ─────────────────────────────────────────────

  async sendInvoiceAuto(id: string) {
    const invoice = await this.findOneInvoice(id);
    if (!(invoice as any).number) throw new BadRequestException('Comptabilisez la facture avant de l\'envoyer.');
    const recipients = await this.getCompanyRecipients(invoice.companyId);
    if (recipients.length === 0) throw new BadRequestException('Aucun contact autorisé à recevoir les factures pour ce client.');
    const linesHtml = (invoice.lines ?? []).map(l =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td></tr>`
    ).join('');
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
      <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
        <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
        <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
      </div>
      <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#C8803A;margin:0 0 4px">FACTURE ${(invoice as any).number}</h2>
        ${invoice.company ? `<p style="color:#7A6050;margin:0 0 16px">Client : <strong style="color:#1A1008">${invoice.company.name}</strong></p>` : ''}
        ${invoice.dueDate ? `<p style="color:#7A6050;margin:0 0 16px">Échéance : <strong style="color:#1A1008">${new Date(invoice.dueDate).toLocaleDateString('fr-LU')}</strong></p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#F5EDE4"><th style="padding:8px 10px;text-align:left;font-size:12px;color:#7A6050">Description</th><th style="padding:8px 10px;text-align:center;font-size:12px;color:#7A6050">Qté</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Prix HT</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Total HT</th></tr></thead>
          <tbody>${linesHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:8px">
          <p style="margin:4px 0;color:#7A6050">HT : ${fmt(invoice.subtotal)}</p>
          <p style="margin:8px 0;font-size:16px;font-weight:bold;background:#C8803A;color:#fff;display:inline-block;padding:6px 16px;border-radius:4px">Total TTC : ${fmt(invoice.total)}</p>
        </div>
        <div style="margin-top:20px;padding:12px;background:#F0FDF4;border-radius:4px;font-size:13px">
          <strong>Coordonnées bancaires</strong><br>Banque : Revolut | IBAN : LT07 3250 0544 6550 1204 | BIC : REVOLT21
        </div>
        ${invoice.notes ? `<p style="margin-top:16px;color:#7A6050;font-size:13px"><em>${invoice.notes}</em></p>` : ''}
      </div>
    </div>`;
    await this.mail.sendBilling({ to: recipients, subject: `Facture ${(invoice as any).number} — INEE`, html });
    return this.prisma.invoice.update({ where: { id }, data: { status: 'SENT' }, include: { company: true, lines: true } });
  }

  // ─── Envoi automatique DEVIS ───────────────────────────────────────────────

  async sendQuoteAuto(id: string) {
    const quote = await this.findOneQuote(id);
    if (quote.status !== 'ACCEPTED') throw new BadRequestException('Le devis doit être accepté avant d\'être envoyé.');
    const recipients = await this.getCompanyRecipients(quote.companyId);
    if (recipients.length === 0) throw new BadRequestException('Aucun contact autorisé à recevoir les documents pour ce client.');
    const linesHtml = (quote.lines ?? []).map((l: any) =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td></tr>`
    ).join('');
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
      <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
        <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
        <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
      </div>
      <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#C8803A;margin:0 0 4px">DEVIS ${quote.number}</h2>
        ${quote.company ? `<p style="color:#7A6050;margin:0 0 16px">Client : <strong style="color:#1A1008">${(quote.company as any).name}</strong></p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#F5EDE4"><th style="padding:8px 10px;text-align:left;font-size:12px;color:#7A6050">Description</th><th style="padding:8px 10px;text-align:center;font-size:12px;color:#7A6050">Qté</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Prix HT</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Total HT</th></tr></thead>
          <tbody>${linesHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:8px">
          <p style="margin:4px 0;color:#7A6050">HT : ${fmt(quote.subtotal)}</p>
          <p style="margin:8px 0;font-size:16px;font-weight:bold;background:#C8803A;color:#fff;display:inline-block;padding:6px 16px;border-radius:4px">Total TTC : ${fmt(quote.total)}</p>
        </div>
        ${quote.notes ? `<p style="margin-top:16px;color:#7A6050;font-size:13px"><em>${quote.notes}</em></p>` : ''}
      </div>
    </div>`;
    await this.mail.sendBilling({ to: recipients, subject: `Devis ${quote.number} — INEE`, html });
    return this.prisma.quote.update({ where: { id }, data: { status: 'SENT' }, include: { company: true, lines: true } });
  }

  async createInvoiceFromQuote(data: CreateInvoiceFromQuoteDto, userId: string) {
    const quote = await this.findOneQuote(data.quoteId);
    if (quote.status !== 'ACCEPTED') throw new BadRequestException('Quote must be accepted before converting to invoice');

    // Brouillon : pas de numéro, l'utilisateur comptabilise ensuite
    return (this.prisma as any).invoice.create({
      data: {
        number: null,
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
    throw new MethodNotAllowedException('Les factures ne peuvent pas être supprimées.');
  }

  async sendInvoice(id: string, recipients: string[]) {
    const invoice = await this.findOneInvoice(id);
    const linesHtml = (invoice.lines ?? []).map(l =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td></tr>`
    ).join('');
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
      <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
        <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
        <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
      </div>
      <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#C8803A;margin:0 0 4px">FACTURE ${invoice.number}</h2>
        ${invoice.company ? `<p style="color:#7A6050;margin:0 0 16px">Client : <strong style="color:#1A1008">${invoice.company.name}</strong></p>` : ''}
        ${invoice.dueDate ? `<p style="color:#7A6050;margin:0 0 16px">Échéance : <strong style="color:#1A1008">${new Date(invoice.dueDate).toLocaleDateString('fr-LU')}</strong></p>` : ''}
        ${(invoice as any).vatMention ? `<p style="background:#FFFBEB;border:1px solid #FDE68A;padding:8px 12px;border-radius:4px;font-size:12px;color:#92400E">${(invoice as any).vatMention}</p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#F5EDE4"><th style="padding:8px 10px;text-align:left;font-size:12px;color:#7A6050">Description</th><th style="padding:8px 10px;text-align:center;font-size:12px;color:#7A6050">Qté</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Prix HT</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Total HT</th></tr></thead>
          <tbody>${linesHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:8px">
          <p style="margin:4px 0;color:#7A6050">HT : ${fmt(invoice.subtotal)}</p>
          <p style="margin:4px 0;color:#7A6050">TVA ${invoice.vatRate}% : ${fmt(invoice.vatAmount)}</p>
          <p style="margin:8px 0;font-size:16px;font-weight:bold;background:#C8803A;color:#fff;display:inline-block;padding:6px 16px;border-radius:4px">Total TTC : ${fmt(invoice.total)}</p>
        </div>
        <div style="margin-top:20px;padding:12px;background:#F0FDF4;border-radius:4px;font-size:13px">
          <strong>Coordonnées bancaires</strong><br>
          Banque : Revolut | IBAN : LT07 3250 0544 6550 1204 | BIC : REVOLT21
        </div>
        ${invoice.notes ? `<p style="margin-top:16px;color:#7A6050;font-size:13px"><em>${invoice.notes}</em></p>` : ''}
      </div>
    </div>`;
    await this.mail.sendBilling({ to: recipients, subject: `Facture ${invoice.number} — INEE`, html });
    return this.prisma.invoice.update({ where: { id }, data: { status: 'SENT' }, include: { company: true, lines: true } });
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
