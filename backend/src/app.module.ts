import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CrmModule } from './crm/crm.module';
import { CommissionsModule } from './commissions/commissions.module';
import { InvoicingModule } from './invoicing/invoicing.module';
import { ServicesModule } from './services/services.module';
import { ProjectsModule } from './projects/projects.module';
import { MailModule } from './mail/mail.module';
import { CreditNotesModule } from './credit-notes/credit-notes.module';
import { LeaveTypesModule } from './leave-types/leave-types.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { CalendarModule } from './calendar/calendar.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuditModule } from './audit/audit.module';
import { ComptabiliteModule } from './comptabilite/comptabilite.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    CrmModule,
    CommissionsModule,
    InvoicingModule,
    ServicesModule,
    ProjectsModule,
    MailModule,
    CreditNotesModule,
    LeaveTypesModule,
    LeaveRequestsModule,
    CalendarModule,
    SubscriptionsModule,
    AuditModule,
    ComptabiliteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
