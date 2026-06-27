import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';

@Module({
  controllers: [CompaniesController, ContactsController, DealsController],
  providers: [CompaniesService, ContactsService, DealsService],
})
export class CrmModule {}
