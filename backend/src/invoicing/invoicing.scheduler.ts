import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

const fmtDate = (d: Date | string | null | undefined, lang = 'fr') =>
  d ? new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-LU') : '—';

// Délais de rappel en jours après l'échéance
const REMINDER_DELAYS = [1, 15, 29]; // Rappel 1, 2, 3

// Intérêts de retard B2B — Loi luxembourgeoise du 18 avril 2004 (Dir. 2011/7/UE)
const INTEREST_RATE_ANNUAL = 0.1115; // Taux BCE référence (3,15%) + 8pp = 11,15% / an
const RECOVERY_FLAT_FEE = 40;        // Forfait de recouvrement fixe : 40 €

function calcInterest(principal: number, daysOverdue: number): { variable: number; fixed: number; total: number } {
  const variable = Math.round(principal * INTEREST_RATE_ANNUAL * (daysOverdue / 365) * 100) / 100;
  return { variable, fixed: RECOVERY_FLAT_FEE, total: Math.round((variable + RECOVERY_FLAT_FEE) * 100) / 100 };
}

@Injectable()
export class InvoicingScheduler {
  private readonly logger = new Logger(InvoicingScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Chaque jour à 08h00 (Europe/Luxembourg) :
   * envoie automatiquement les rappels de factures impayées.
   */
  @Cron('0 8 * * *', { timeZone: 'Europe/Luxembourg' })
  async handleDailyReminders() {
    this.logger.log('Vérification des factures impayées...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Passer automatiquement en OVERDUE toutes les factures SENT dont l'échéance est dépassée
    try {
      const overdueMoved = await (this.prisma as any).invoice.updateMany({
        where: {
          status: 'SENT',
          dueDate: { lt: today },
          number: { not: null },
        },
        data: { status: 'OVERDUE' },
      });
      if (overdueMoved.count > 0) {
        this.logger.log(`${overdueMoved.count} facture(s) passée(s) automatiquement en OVERDUE.`);
      }
    } catch (err) {
      this.logger.error('Erreur lors du passage automatique en OVERDUE', err);
    }

    let sent = 0;

    try {
      // Chercher les factures SENT ou OVERDUE, avec échéance dépassée, pas encore payées
      const invoices = await (this.prisma as any).invoice.findMany({
        where: {
          status: { in: ['SENT', 'OVERDUE'] },
          dueDate: { lt: today },
          number: { not: null },
          reminderLevel: { lt: 3 },
        },
        include: {
          company: true,
          lines: true,
        },
      });

      for (const invoice of invoices) {
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const currentLevel = invoice.reminderLevel ?? 0;
        const nextLevel = currentLevel + 1;

        // Vérifier si le délai pour le prochain rappel est atteint
        const requiredDelay = REMINDER_DELAYS[currentLevel];
        if (daysOverdue < requiredDelay) continue;

        // Récupérer les destinataires
        const contacts = await this.prisma.contact.findMany({
          where: { companyId: invoice.companyId, canReceiveInvoices: true, isActive: true, email: { not: null } } as any,
          select: { email: true },
        });
        const recipients = contacts.map((c: any) => c.email).filter(Boolean);
        if (recipients.length === 0) {
          this.logger.warn(`Facture ${invoice.number} : aucun destinataire trouvé pour rappel ${nextLevel}`);
          continue;
        }

        const invoiceLang = invoice.lang ?? 'fr';
        const subject = this.buildSubject(nextLevel, invoice.number, invoiceLang);
        // Intérêts uniquement à partir du 2ème rappel (J+15)
        const interestData = (!invoice.waivedInterest && nextLevel >= 2)
          ? calcInterest(invoice.total, daysOverdue)
          : { variable: 0, fixed: 0, total: 0 };
        const html = this.buildHtml(nextLevel, invoice, invoiceLang, daysOverdue, interestData);

        await this.mail.sendBilling({ to: recipients, subject, html });

        await (this.prisma as any).invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'OVERDUE',
            reminderLevel: nextLevel,
            lastReminderAt: new Date(),
          },
        });

        await this.audit.log({
          entityType: 'Invoice',
          entityId: invoice.id,
          action: `Rappel ${nextLevel} envoyé automatiquement`,
          details: `J+${daysOverdue} · Destinataires : ${recipients.join(', ')}`,
        });

        sent++;
        this.logger.log(`Rappel ${nextLevel} envoyé → ${invoice.number} (J+${daysOverdue})`);
      }

      if (sent === 0) {
        this.logger.debug('Aucun rappel à envoyer aujourd\'hui.');
      } else {
        this.logger.log(`${sent} rappel(s) envoyé(s).`);
      }
    } catch (err) {
      this.logger.error('Erreur lors de l\'envoi des rappels automatiques', err);
    }
  }

  private buildSubject(level: number, number: string, lang = 'fr'): string {
    const subjects: Record<number, Record<string, string>> = {
      1: { fr: `Rappel — Facture N° ${number} en attente de paiement`,    en: `Payment reminder — Invoice No. ${number}` },
      2: { fr: `2ème rappel — Facture N° ${number} impayée`,              en: `2nd reminder — Invoice No. ${number} unpaid` },
      3: { fr: `DERNIER RAPPEL — Mise en demeure — Facture N° ${number}`, en: `FINAL NOTICE — Invoice No. ${number}` },
    };
    return subjects[level]?.[lang] ?? `Rappel facture N° ${number}`;
  }

  private buildHtml(level: number, invoice: any, lang = 'fr', daysOverdue = 0, interest = { variable: 0, fixed: 0, total: 0 }): string {
    const linesHtml = (invoice.lines ?? []).map((l: any) =>
      `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td>
      </tr>`
    ).join('');

    const due = fmtDate(invoice.dueDate, lang);
    const messages: Record<number, Record<string, { title: string; intro: string; warning?: string }>> = {
      1: {
        fr: { title: 'Rappel de paiement', intro: `Nous nous permettons de vous rappeler que la facture <strong>${invoice.number}</strong> d'un montant de <strong>${fmt(invoice.total)}</strong>, dont l'échéance était fixée au <strong>${due}</strong>, reste à ce jour impayée.<br><br>Si vous avez déjà procédé au règlement, veuillez ne pas tenir compte de ce message. Dans le cas contraire, nous vous remercions de bien vouloir régulariser votre situation dans les meilleurs délais.` },
        en: { title: 'Payment reminder', intro: `This is a friendly reminder that invoice <strong>${invoice.number}</strong> for <strong>${fmt(invoice.total)}</strong>, which was due on <strong>${due}</strong>, remains unpaid.<br><br>If you have already made the payment, please disregard this message. Otherwise, we kindly ask you to settle the outstanding amount at your earliest convenience.` },
      },
      2: {
        fr: { title: '2ème rappel — Facture impayée', intro: `Malgré notre précédent rappel, nous n'avons toujours pas reçu le paiement de la facture <strong>${invoice.number}</strong> d'un montant de <strong>${fmt(invoice.total)}</strong>, échue le <strong>${due}</strong>.<br><br>Nous vous prions instamment de procéder au règlement dans un délai de <strong>8 jours</strong> afin d'éviter tout recours supplémentaire.`, warning: "Sans retour de votre part sous 8 jours, nous nous verrons contraints d'engager une procédure de recouvrement." },
        en: { title: '2nd reminder — Unpaid invoice', intro: `Despite our previous reminder, we have not yet received payment for invoice <strong>${invoice.number}</strong> for <strong>${fmt(invoice.total)}</strong>, which was due on <strong>${due}</strong>.<br><br>We urgently request that you settle this balance within <strong>8 days</strong> to avoid further action.`, warning: 'Failure to pay within 8 days may result in debt collection proceedings.' },
      },
      3: {
        fr: { title: 'DERNIER RAPPEL — Mise en demeure', intro: `En l'absence de réponse à nos précédents rappels, nous vous mettons en demeure de régler la facture <strong>${invoice.number}</strong> d'un montant de <strong>${fmt(invoice.total)}</strong>, échue le <strong>${due}</strong>, dans un délai de <strong>8 jours calendaires</strong> à compter de la réception du présent courrier.<br><br>À défaut de paiement dans ce délai, nous nous réservons le droit d'engager toute procédure judiciaire ou de recouvrement nécessaire, sans autre préavis.`, warning: 'Ce courrier vaut mise en demeure au sens du droit luxembourgeois.' },
        en: { title: 'FINAL NOTICE — Formal demand', intro: `Having received no response to our previous reminders, we hereby formally demand payment of invoice <strong>${invoice.number}</strong> for <strong>${fmt(invoice.total)}</strong>, due on <strong>${due}</strong>, within <strong>8 calendar days</strong> of receipt of this notice.<br><br>Failure to pay within this period will leave us no alternative but to pursue legal or debt collection proceedings without further notice.`, warning: 'This notice constitutes a formal demand under Luxembourg law.' },
      },
    };
    const msg = messages[level]?.[lang] ?? messages[1].fr;

    const headerColor = level === 3 ? '#DC2626' : '#C8803A';

    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1A1008">
  <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
    <h1 style="color:#C8803A;margin:0;font-size:24px;letter-spacing:3px">INEE</h1>
    <p style="color:#F5EDE4;margin:4px 0 0;font-size:12px">37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830</p>
  </div>
  <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
    <div style="border-left:4px solid ${headerColor};padding-left:12px;margin-bottom:20px">
      <h2 style="color:${headerColor};margin:0 0 4px;font-size:16px">${msg.title}</h2>
      <p style="color:#7A6050;margin:0;font-size:12px">Facture N° ${invoice.number} · Émise le ${fmtDate(invoice.issueDate)}</p>
    </div>

    <p style="font-size:14px;line-height:1.6;color:#1A1008">${msg.intro}</p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:13px">
      <thead>
        <tr style="background:#F5EDE4">
          <th style="padding:8px 10px;text-align:left;color:#7A6050">Description</th>
          <th style="padding:8px 10px;text-align:center;color:#7A6050">Qté</th>
          <th style="padding:8px 10px;text-align:right;color:#7A6050">Prix HT</th>
          <th style="padding:8px 10px;text-align:right;color:#7A6050">Total HT</th>
        </tr>
      </thead>
      <tbody>${linesHtml}</tbody>
    </table>

    <div style="text-align:right;background:#F8F5F2;padding:12px 16px;border-radius:4px;margin-bottom:16px">
      <p style="margin:4px 0;font-size:13px;color:#7A6050">HT : ${fmt(invoice.subtotal)}</p>
      <p style="margin:4px 0;font-size:13px;color:#7A6050">TVA : ${fmt(invoice.vatAmount)}</p>
      <p style="margin:8px 0 0;font-size:16px;font-weight:bold;color:${headerColor}">Total TTC : ${fmt(invoice.total)}</p>
    </div>

    ${interest.total > 0 ? `
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:4px;padding:12px 16px;font-size:13px;margin-bottom:16px">
      <strong style="color:#C2410C">${lang === 'en' ? '⚠ Late payment interest — Luxembourg Law of 18 April 2004' : '⚠ Intérêts de retard — Loi luxembourgeoise du 18 avril 2004'}</strong>
      <table style="width:100%;margin-top:8px;font-size:12px;color:#7C2D12">
        <tr>
          <td>${lang === 'en' ? 'Days overdue' : 'Jours de retard'}</td>
          <td style="text-align:right"><strong>${daysOverdue} ${lang === 'en' ? 'days' : 'jours'}</strong></td>
        </tr>
        <tr>
          <td>${lang === 'en' ? 'Variable interest (ECB rate + 8pp = 11.15%/yr)' : 'Intérêts variables (taux BCE + 8pp = 11,15%/an)'}</td>
          <td style="text-align:right"><strong>${fmt(interest.variable)}</strong></td>
        </tr>
        <tr>
          <td>${lang === 'en' ? 'Fixed recovery fee (Art. L.115-2)' : 'Forfait de recouvrement fixe (Art. L.115-2)'}</td>
          <td style="text-align:right"><strong>${fmt(interest.fixed)}</strong></td>
        </tr>
        <tr style="border-top:1px solid #FED7AA">
          <td style="padding-top:6px"><strong>${lang === 'en' ? 'Total due incl. interest' : 'Total dû intérêts inclus'}</strong></td>
          <td style="text-align:right;padding-top:6px"><strong style="font-size:14px">${fmt(invoice.total + interest.total)}</strong></td>
        </tr>
      </table>
    </div>` : ''}

    <div style="background:#F0FDF4;border-radius:4px;padding:12px 16px;font-size:13px;margin-bottom:16px">
      <strong>Coordonnées bancaires</strong><br>
      Banque : Revolut | IBAN : LT07 3250 0544 6550 1204 | BIC : REVOLT21
    </div>

    ${msg.warning ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:4px;padding:12px 16px;font-size:13px;color:#DC2626"><strong>⚠ ${msg.warning}</strong></div>` : ''}
  </div>
</div>`;
  }
}
