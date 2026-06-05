import { Injectable, NotFoundException, BadRequestException, MethodNotAllowedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, CreateInvoiceFromQuoteDto } from './dto/invoice.dto';

const VAT_LU = 17;
const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

@Injectable()
export class InvoicingService {
  constructor(private prisma: PrismaService, private mail: MailService, private audit: AuditService) {}

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

    const quote = await this.prisma.quote.create({
      data: { ...rest, number, createdById: userId, ...totals, lines: { create: lines.map(l => ({ ...l, total: this.lineTotal(l) })) } },
      include: { company: true, lines: true },
    });
    await this.audit.log({ entityType: 'Quote', entityId: quote.id, userId, action: `Devis créé (${number})`, details: `Total : ${totals.total} €` });
    return quote;
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

    const inv = await (this.prisma as any).invoice.create({
      data: {
        ...rest,
        createdById: userId,
        ...totals,
        number: null,
        lines: { create: lines.map(l => ({ ...l, total: this.lineTotal(l) })) },
      },
      include: { company: true, lines: true },
    });
    await this.audit.log({ entityType: 'Invoice', entityId: inv.id, userId, action: 'Brouillon créé', details: `Client : ${inv.company?.name ?? '—'} · Total : ${inv.total} €` });
    return inv;
  }

  async postInvoice(id: string) {
    const inv = await this.findOneInvoice(id);
    if ((inv as any).number) throw new BadRequestException('Cette facture est déjà comptabilisée.');
    const number = await this.nextInvoiceNumber();
    const now = new Date();
    const posted = await (this.prisma as any).invoice.update({
      where: { id },
      data: { number, issueDate: now },
      include: { company: true, lines: true },
    });
    await this.audit.log({ entityType: 'Invoice', entityId: id, action: `Comptabilisée → ${number}`, details: `Date : ${now.toLocaleDateString('fr-LU')}` });
    return posted;
  }

  // ─── Templates email facture ──────────────────────────────────────────────

  private buildInvoiceEmailHtml(invoice: any, type: string, lang: string): string {
    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-LU') : '—';
    const num = invoice.number ?? '—';
    const tot = fmt(invoice.total);
    const due = fmtDate(invoice.dueDate);
    const bank = `Revolut | IBAN : LT07 3250 0544 6550 1204 | BIC : REVOLT21`;

    const templates: Record<string, Record<string, { subject: string; body: string }>> = {
      send: {
        fr: {
          subject: `Facture N° ${num} — INEE`,
          body: `Madame, Monsieur,\n\nVeuillez trouver ci-joint notre facture N° ${num} d'un montant de ${tot}, établie le ${fmtDate(invoice.issueDate)} et payable au plus tard le ${due}.\n\nNos coordonnées bancaires :\n${bank}\n\nPour toute question, contactez-nous à invoices@inee.lu.\n\nCordialement,\nINEE S.à r.l.`,
        },
        en: {
          subject: `Invoice No. ${num} — INEE`,
          body: `Dear Sir or Madam,\n\nPlease find attached our invoice No. ${num} for ${tot}, dated ${fmtDate(invoice.issueDate)} and payable by ${due}.\n\nOur bank details:\n${bank}\n\nFor any questions, please contact us at invoices@inee.lu.\n\nKind regards,\nINEE S.à r.l.`,
        },
      },
      reminder1: {
        fr: {
          subject: `Rappel — Facture N° ${num} échue le ${due}`,
          body: `Madame, Monsieur,\n\nSauf erreur de notre part, notre facture N° ${num} d'un montant de ${tot}, dont l'échéance était fixée au ${due}, n'a pas encore été réglée.\n\nNous vous serions reconnaissants de bien vouloir procéder au paiement dans les meilleurs délais.\n\nSi ce paiement a déjà été effectué, veuillez ignorer ce message.\n\nCordialement,\nINEE S.à r.l.`,
        },
        en: {
          subject: `Reminder — Invoice No. ${num} due ${due}`,
          body: `Dear Sir or Madam,\n\nUnless there has been an oversight, our invoice No. ${num} for ${tot}, which was due on ${due}, has not yet been settled.\n\nWe kindly ask you to proceed with payment at your earliest convenience.\n\nIf payment has already been made, please disregard this message.\n\nKind regards,\nINEE S.à r.l.`,
        },
      },
      reminder2: {
        fr: {
          subject: `2ème rappel — Facture N° ${num} — Règlement urgent`,
          body: `Madame, Monsieur,\n\nMalgré notre premier rappel, nous n'avons pas reçu le règlement de notre facture N° ${num} d'un montant de ${tot}, échue depuis le ${due}.\n\nNous vous invitons instamment à régulariser votre situation dans un délai de 8 jours ouvrés.\n\nConformément à nos CGV, des intérêts de retard au taux de 8 %/an sont applicables à compter du jour suivant l'échéance.\n\nCordialement,\nINEE S.à r.l.`,
        },
        en: {
          subject: `2nd Reminder — Invoice No. ${num} — Urgent Payment Required`,
          body: `Dear Sir or Madam,\n\nDespite our previous reminder, we have not received payment for invoice No. ${num} for ${tot}, due on ${due}.\n\nWe strongly urge you to settle this balance within 8 business days.\n\nAs per our Terms and Conditions, late payment interest at 8% per annum applies from the day following the due date.\n\nKind regards,\nINEE S.à r.l.`,
        },
      },
      reminder3: {
        fr: {
          subject: `DERNIER RAPPEL — Facture N° ${num} — Mise en demeure`,
          body: `Madame, Monsieur,\n\nMalgré nos deux relances précédentes, la facture N° ${num} d'un montant de ${tot} demeure impayée depuis le ${due}.\n\nSans règlement sous 48 heures, nous procéderons à :\n• Application d'une indemnité forfaitaire de 150 EUR\n• Suspension de toute prestation en cours\n• Transmission à notre service juridique pour recouvrement\n\nContactez-nous immédiatement à invoices@inee.lu pour trouver une solution amiable.\n\nINEE S.à r.l.`,
        },
        en: {
          subject: `FINAL NOTICE — Invoice No. ${num} — Formal Demand`,
          body: `Dear Sir or Madam,\n\nDespite two previous reminders, invoice No. ${num} for ${tot} remains unpaid since ${due}.\n\nUnless full payment is received within 48 hours, we will:\n• Apply a flat-rate collection fee of €150\n• Suspend all ongoing services\n• Refer this matter to our legal department\n\nPlease contact us immediately at invoices@inee.lu.\n\nINEE S.à r.l.`,
        },
      },
    };

    const tpl = templates[type]?.[lang] ?? templates.send.fr;
    const bodyHtml = tpl.body.replace(/\n/g, '<br>');
    return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
      <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
        <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
        <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
      </div>
      <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
        <p style="color:#1A1008;line-height:1.7">${bodyHtml}</p>
        <div style="margin-top:20px;padding:12px;background:#F0FDF4;border-radius:4px;font-size:13px">
          <strong>Coordonnées bancaires / Bank details</strong><br>
          ${bank}
        </div>
      </div>
    </div>`;
  }

  // ─── Envoi facture avec options (type + langue) ────────────────────────────

  async sendInvoiceWithOptions(id: string, type: string, lang: string, userId?: string, pdfBase64?: string) {
    const invoice = await this.findOneInvoice(id);
    if (!(invoice as any).number) throw new BadRequestException('Comptabilisez la facture avant de l\'envoyer.');
    const recipients = await this.getCompanyRecipients(invoice.companyId);
    if (recipients.length === 0) throw new BadRequestException('Aucun contact autorisé pour ce client.');

    const html = this.buildInvoiceEmailHtml(invoice, type, lang);
    const num = (invoice as any).number ?? '';
    const subjects: Record<string, Record<string, string>> = {
      send:      { fr: `Facture N° ${num} — INEE`, en: `Invoice No. ${num} — INEE` },
      reminder1: { fr: `Rappel 1 — Facture N° ${num}`, en: `Reminder 1 — Invoice No. ${num}` },
      reminder2: { fr: `Rappel 2 — Facture N° ${num}`, en: `2nd Reminder — Invoice No. ${num}` },
      reminder3: { fr: `DERNIER RAPPEL — Facture N° ${num}`, en: `FINAL NOTICE — Invoice No. ${num}` },
    };
    const subject = subjects[type]?.[lang] ?? subjects.send.fr;
    await this.mail.sendBilling({ to: recipients, subject, html, pdfBase64, pdfFilename: pdfBase64 ? `${num}.pdf` : undefined });
    await this.audit.log({ entityType: 'Invoice', entityId: id, userId, action: `Facture envoyée (${type}, ${lang})`, details: `Destinataires : ${recipients.join(', ')}` });
    return (this.prisma as any).invoice.update({
      where: { id },
      data: { status: 'SENT', lang },
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
    await this.audit.log({ entityType: 'Invoice', entityId: id, action: 'Envoyée par email', details: `Destinataires : ${recipients.join(', ')}` });
    return this.prisma.invoice.update({ where: { id }, data: { status: 'SENT' }, include: { company: true, lines: true } });
  }

  // ─── Envoi automatique DEVIS ───────────────────────────────────────────────

  async sendQuoteAuto(id: string, userId?: string, pdfBase64?: string) {
    const quote = await this.findOneQuote(id);
    if (['REJECTED', 'EXPIRED', 'CANCELLED'].includes(quote.status as string)) {
      throw new BadRequestException('Ce devis ne peut plus être envoyé.');
    }
    const recipients = await this.getCompanyRecipients(quote.companyId);
    // Récupérer l'email de l'utilisateur connecté comme expéditeur
    const senderEmail = 'INEE <contact@inee.lu>';
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
    await this.mail.send({ from: senderEmail, to: recipients, subject: `Devis ${quote.number} — INEE`, html, pdfBase64, pdfFilename: pdfBase64 ? `${quote.number}.pdf` : undefined });
    await this.audit.log({ entityType: 'Quote', entityId: id, userId, action: 'Devis envoyé par email', details: `De : ${senderEmail} · À : ${recipients.join(', ')}` });
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

    const inv = await this.prisma.invoice.update({
      where: { id },
      data: { ...updateData, lines: { deleteMany: {}, create: lines.map(l => ({ ...l, total: Math.round(l.quantity * l.unitPrice * 100) / 100 })) } },
      include: { company: true, lines: true },
    });
    if (status) await this.audit.log({ entityType: 'Invoice', entityId: id, action: `Statut → ${status}` });
    return inv;
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
