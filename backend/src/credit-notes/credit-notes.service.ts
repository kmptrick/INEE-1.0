import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditNoteDto, UpdateCreditNoteDto } from './dto/credit-note.dto';
import { MailService } from '../mail/mail.service';

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

const VAT_LU = 17;

const CN_INCLUDE = {
  invoice: { select: { id: true, number: true } },
  company: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  lines: true,
};

@Injectable()
export class CreditNotesService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  private async nextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await (this.prisma as any).creditNote.count();
    return `NC - ${year} - ${String(count + 1).padStart(3, '0')}`;
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

  async send(id: string) {
    const cn = await this.findOne(id);
    if (cn.status !== 'ISSUED') throw new BadRequestException('La note de crédit doit être émise avant d\'être envoyée.');
    const companyId = (cn as any).companyId ?? (cn as any).invoice?.companyId;
    if (!companyId) throw new BadRequestException('Aucun client associé à cette note de crédit.');

    const contacts = await this.prisma.contact.findMany({
      where: { companyId, canReceiveInvoices: true, isActive: true, email: { not: null } } as any,
      select: { email: true },
    });
    const recipients = contacts.map((c: any) => c.email).filter(Boolean);
    if (recipients.length === 0) throw new BadRequestException('Aucun contact autorisé à recevoir les documents pour ce client.');

    const linesHtml = ((cn as any).lines ?? []).map((l: any) =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td></tr>`
    ).join('');

    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
      <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
        <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
        <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
      </div>
      <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="color:#7C3AED;margin:0 0 4px">NOTE DE CRÉDIT ${cn.number}</h2>
        ${(cn as any).company ? `<p style="color:#7A6050;margin:0 0 16px">Client : <strong style="color:#1A1008">${(cn as any).company.name}</strong></p>` : ''}
        ${(cn as any).invoice ? `<p style="color:#7A6050;margin:0 0 16px">Facture liée : <strong style="color:#1A1008">${(cn as any).invoice.number}</strong></p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#F5EDE4"><th style="padding:8px 10px;text-align:left;font-size:12px;color:#7A6050">Description</th><th style="padding:8px 10px;text-align:center;font-size:12px;color:#7A6050">Qté</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Prix HT</th><th style="padding:8px 10px;text-align:right;font-size:12px;color:#7A6050">Total HT</th></tr></thead>
          <tbody>${linesHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:8px;font-style:italic;color:#7C3AED;font-weight:bold">
          Montant crédité : − ${fmt(cn.total)}
        </div>
        ${cn.notes ? `<p style="margin-top:16px;color:#7A6050;font-size:13px"><em>${cn.notes}</em></p>` : ''}
      </div>
    </div>`;

    await this.mail.sendBilling({ to: recipients, subject: `Note de crédit ${cn.number} — INEE`, html });
    return (this.prisma as any).creditNote.update({ where: { id }, data: {}, include: CN_INCLUDE });
  }
}
