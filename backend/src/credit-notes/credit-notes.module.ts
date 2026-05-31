import { Module } from '@nestjs/common';
import { CreditNotesController } from './credit-notes.controller';
import { CreditNotesService } from './credit-notes.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [CreditNotesController],
  providers: [CreditNotesService],
})
export class CreditNotesModule {}
