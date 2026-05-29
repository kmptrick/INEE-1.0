import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvoicingService } from './invoicing.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, CreateInvoiceFromQuoteDto } from './dto/invoice.dto';
import { IsArray, IsString } from 'class-validator';

class SendDto {
  @IsArray() @IsString({ each: true })
  recipients: string[];
}

@UseGuards(JwtAuthGuard)
@Controller('invoicing')
export class InvoicingController {
  constructor(private service: InvoicingService) {}

  @Get('stats')
  getStats() { return this.service.getStats(); }

  // ─── Devis ─────────────────────────────────────────────────────────────────

  @Get('quotes')
  findAllQuotes(@Query('status') status?: string) { return this.service.findAllQuotes(status); }

  @Get('quotes/:id')
  findOneQuote(@Param('id') id: string) { return this.service.findOneQuote(id); }

  @Post('quotes')
  createQuote(@Body() dto: CreateQuoteDto, @CurrentUser() user: { sub: string }) { return this.service.createQuote(dto, user.sub); }

  @Post('quotes/:id/send')
  sendQuote(@Param('id') id: string, @Body() dto: SendDto) { return this.service.sendQuote(id, dto.recipients); }

  @Put('quotes/:id')
  updateQuote(@Param('id') id: string, @Body() dto: UpdateQuoteDto) { return this.service.updateQuote(id, dto); }

  @Delete('quotes/:id')
  removeQuote(@Param('id') id: string) { return this.service.removeQuote(id); }

  // ─── Factures ──────────────────────────────────────────────────────────────

  @Get('invoices')
  findAllInvoices(@Query('status') status?: string) { return this.service.findAllInvoices(status); }

  @Get('invoices/:id')
  findOneInvoice(@Param('id') id: string) { return this.service.findOneInvoice(id); }

  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: { sub: string }) { return this.service.createInvoice(dto, user.sub); }

  @Post('invoices/from-quote')
  createFromQuote(@Body() dto: CreateInvoiceFromQuoteDto, @CurrentUser() user: { sub: string }) { return this.service.createInvoiceFromQuote(dto, user.sub); }

  @Post('invoices/:id/send')
  sendInvoice(@Param('id') id: string, @Body() dto: SendDto) { return this.service.sendInvoice(id, dto.recipients); }

  @Put('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) { return this.service.updateInvoice(id, dto); }

  @Delete('invoices/:id')
  removeInvoice(@Param('id') id: string) { return this.service.removeInvoice(id); }
}
