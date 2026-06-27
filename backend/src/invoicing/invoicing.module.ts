import { Module } from '@nestjs/common';
import { InvoicingController } from './invoicing.controller';
import { InvoicingService } from './invoicing.service';
import { InvoicingScheduler } from './invoicing.scheduler';
import { MailModule } from '../mail/mail.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MailModule, AuditModule, PrismaModule],
  controllers: [InvoicingController],
  providers: [InvoicingService, InvoicingScheduler],
})
export class InvoicingModule {}
