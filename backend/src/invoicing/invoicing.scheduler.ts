import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

const fmtDate = (d: Date | string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-LU') : '—';

// Délais de rappel en jours après l'échéance
const REMINDER_DELAYS = [1, 15, 29]; // Rappel 1, 2, 3

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

        const subject = this.buildSubject(nextLevel, invoice.number);
        const html = this.buildHtml(nextLevel, invoice);

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

  private buildSubject(level: number, number: string): string {
    const subjects: Record<number, string> = {
      1: `Rappel — Facture N° ${number} en attente de paiement`,
      2: `2ème rappel — Facture N° ${number} impayée`,
      3: `DERNIER RAPPEL — Mise en demeure — Facture N° ${number}`,
    };
    return subjects[level] ?? `Rappel facture N° ${number}`;
  }

  private buildHtml(level: number, invoice: any): string {
    const linesHtml = (invoice.lines ?? []).map((l: any) =>
      `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${l.description}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${fmt(l.unitPrice)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${fmt(l.total)}</td>
      </tr>`
    ).join('');

    const messages: Record<number, { title: string; intro: string; warning?: string }> = {
      1: {
        title: 'Rappel de paiement',
        intro: `Nous nous permettons de vous rappeler que la facture <strong>${invoice.number}</strong> d'un montant de <strong>${fmt(invoice.total)}</strong>, dont l'échéance était fixée au <strong>${fmtDate(invoice.dueDate)}</strong>, reste à ce jour impayée.<br><br>Si vous avez déjà procédé au règlement, veuillez ne pas tenir compte de ce message. Dans le cas contraire, nous vous remercions de bien vouloir régulariser votre situation dans les meilleurs délais.`,
      },
      2: {
        title: '2ème rappel — Facture impayée',
        intro: `Malgré notre précédent rappel, nous n'avons toujours pas reçu le paiement de la facture <strong>${invoice.number}</strong> d'un montant de <strong>${fmt(invoice.total)}</strong>, échue le <strong>${fmtDate(invoice.dueDate)}</strong>.<br><br>Nous vous prions instamment de procéder au règlement dans un délai de <strong>8 jours</strong> afin d'éviter tout recours supplémentaire.`,
        warning: 'Sans retour de votre part sous 8 jours, nous nous verrons contraints d\'engager une procédure de recouvrement.',
      },
      3: {
        title: 'DERNIER RAPPEL — Mise en demeure',
        intro: `En l'absence de réponse à nos précédents rappels, nous vous mettons en demeure de régler la facture <strong>${invoice.number}</strong> d'un montant de <strong>${fmt(invoice.total)}</strong>, échue le <strong>${fmtDate(invoice.dueDate)}</strong>, dans un délai de <strong>8 jours calendaires</strong> à compter de la réception du présent courrier.<br><br>À défaut de paiement dans ce délai, nous nous réservons le droit d'engager toute procédure judiciaire ou de recouvrement nécessaire, sans autre préavis.`,
        warning: 'Ce courrier vaut mise en demeure au sens du droit luxembourgeois.',
      },
    };

    const msg = messages[level] ?? messages[1];
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

    <div style="background:#F0FDF4;border-radius:4px;padding:12px 16px;font-size:13px;margin-bottom:16px">
      <strong>Coordonnées bancaires</strong><br>
      Banque : Revolut | IBAN : LT07 3250 0544 6550 1204 | BIC : REVOLT21
    </div>

    ${msg.warning ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:4px;padding:12px 16px;font-size:13px;color:#DC2626"><strong>⚠ ${msg.warning}</strong></div>` : ''}
  </div>
</div>`;
  }
}
