import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';

const VAT_LU = 17;

const SUB_INCLUDE = {
  company: { select: { id: true, name: true } },
  lines: true,
};

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  // ─── Numérotation ──────────────────────────────────────────────────────────

  private async nextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await (this.prisma as any).subscription.count();
    return `Sosc - ${year} - ${String(count + 1).padStart(3, '0')}`;
  }

  // ─── Calculs ───────────────────────────────────────────────────────────────

  private calcTotals(
    lines: { quantity: number; unitPrice: number; discountRate?: number; lineVatRate?: number }[],
    defaultVatRate = VAT_LU,
  ) {
    let subtotal = 0;
    let vatAmount = 0;
    for (const l of lines) {
      const disc = l.discountRate ?? 0;
      const lt = Math.round(l.quantity * l.unitPrice * (1 - disc / 100) * 100) / 100;
      subtotal += lt;
      vatAmount += Math.round(lt * (l.lineVatRate ?? defaultVatRate)) / 100;
    }
    subtotal  = Math.round(subtotal  * 100) / 100;
    vatAmount = Math.round(vatAmount * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    return { subtotal, vatRate: defaultVatRate, vatAmount, total };
  }

  private lineTotal(l: { quantity: number; unitPrice: number; discountRate?: number }): number {
    const disc = l.discountRate ?? 0;
    return Math.round(l.quantity * l.unitPrice * (1 - disc / 100) * 100) / 100;
  }

  // ─── Avancement de la date ─────────────────────────────────────────────────

  private advanceDate(date: Date, frequency: string): Date {
    const d = new Date(date);
    switch (frequency) {
      case 'MONTHLY':     d.setMonth(d.getMonth() + 1);         break;
      case 'QUARTERLY':   d.setMonth(d.getMonth() + 3);         break;
      case 'SEMI_ANNUAL': d.setMonth(d.getMonth() + 6);         break;
      case 'ANNUAL':      d.setFullYear(d.getFullYear() + 1);   break;
    }
    return d;
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  findAll(status?: string) {
    return (this.prisma as any).subscription.findMany({
      where: status ? { status } : undefined,
      include: SUB_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sub = await (this.prisma as any).subscription.findUnique({ where: { id }, include: SUB_INCLUDE });
    if (!sub) throw new NotFoundException('Souscription introuvable');
    return sub;
  }

  async create(data: CreateSubscriptionDto, userId: string) {
    const { lines, vatRate = VAT_LU, startDate, ...rest } = data;
    const totals  = this.calcTotals(lines, vatRate);
    const number  = await this.nextNumber();
    const startDt = new Date(startDate);

    return (this.prisma as any).subscription.create({
      data: {
        ...rest,
        number,
        ...totals,
        startDate:       startDt,
        nextBillingDate: startDt,
        createdById: userId,
        lines: {
          create: lines.map(l => ({ ...l, total: this.lineTotal(l) })),
        },
      },
      include: SUB_INCLUDE,
    });
  }

  async update(id: string, data: UpdateSubscriptionDto) {
    const sub = await this.findOne(id);
    const { lines, vatRate = sub.vatRate, ...rest } = data;
    const updates: any = { ...rest };

    if (lines) {
      const totals = this.calcTotals(lines, vatRate);
      Object.assign(updates, { ...totals });
      await (this.prisma as any).subscriptionLine.deleteMany({ where: { subscriptionId: id } });
      updates.lines = { create: lines.map(l => ({ ...l, total: this.lineTotal(l) })) };
    }

    return (this.prisma as any).subscription.update({
      where: { id },
      data: updates,
      include: SUB_INCLUDE,
    });
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    await this.findOne(id);
    return (this.prisma as any).subscription.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma as any).subscription.delete({ where: { id } });
  }

  // ─── Génération automatique des factures ───────────────────────────────────

  async generateDueInvoices() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueSubs = await (this.prisma as any).subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: today },
      },
      include: { lines: true },
    });

    const generated: any[] = [];

    for (const sub of dueSubs) {
      // Numéro de facture
      // Créer la facture brouillon SANS numéro (sera comptabilisée par l'utilisateur)
      const invoice = await (this.prisma as any).invoice.create({
        data: {
          number: null,
          status:     'DRAFT',
          companyId:  sub.companyId,
          vatRate:    sub.vatRate,
          vatMention: sub.vatMention,
          notes:      `[Souscription ${sub.number}]${sub.notes ? ' ' + sub.notes : ''}`,
          subtotal:   sub.subtotal,
          vatAmount:  sub.vatAmount,
          total:      sub.total,
          paidAmount: 0,
          lines: {
            create: sub.lines.map((l: any) => ({
              serviceId:    l.serviceId,
              description:  l.description,
              quantity:     l.quantity,
              unitPrice:    l.unitPrice,
              unite:        l.unite,
              discountRate: l.discountRate,
              lineVatRate:  l.lineVatRate,
              total:        l.total,
            })),
          },
        },
      });

      // Avancer la date de facturation
      const next = this.advanceDate(new Date(sub.nextBillingDate), sub.frequency);
      await (this.prisma as any).subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: next },
      });

      generated.push({
        subscriptionId: sub.id,
        subscriptionNumber: sub.number,
        invoiceId: invoice.id,
      });
    }

    return { generated: generated.length, invoices: generated };
  }
}
