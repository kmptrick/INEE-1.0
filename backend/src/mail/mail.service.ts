import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  /** Generic send — from defaults to SMTP_FROM env var */
  async send(params: SendMailParams): Promise<void> {
    const from = params.from ?? process.env.SMTP_FROM ?? 'INEE <noreply@inee.lu>';
    if (!this.transporter) {
      this.logger.log(`[MAIL MOCK] From: ${from} | To: ${[params.to].flat().join(', ')} | Subject: ${params.subject}`);
      return;
    }
    await this.transporter.sendMail({ from, to: params.to, subject: params.subject, html: params.html });
  }

  /** Billing emails — sender is always invoices@inee.lu */
  async sendBilling(params: Omit<SendMailParams, 'from'>): Promise<void> {
    return this.send({
      ...params,
      from: process.env.SMTP_FROM_INVOICING ?? 'INEE Facturation <invoices@inee.lu>',
    });
  }

  /** System / transactional email (password reset, welcome) */
  async sendSystem(params: Omit<SendMailParams, 'from'>): Promise<void> {
    return this.send({
      ...params,
      from: process.env.SMTP_FROM ?? 'INEE <noreply@inee.lu>',
    });
  }
}
