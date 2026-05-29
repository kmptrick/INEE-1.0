import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceLineDto {
  @IsOptional() @IsString()
  serviceId?: string;

  @IsString()
  description: string;

  @IsNumber() @Min(0)
  quantity: number;

  @IsNumber() @Min(0)
  unitPrice: number;

  @IsOptional() @IsString()
  unite?: string;

  @IsOptional() @IsNumber() @Min(0)
  discountRate?: number;

  @IsOptional() @IsNumber() @Min(0)
  lineVatRate?: number;

  @IsOptional() @IsDateString()
  periodStart?: string;

  @IsOptional() @IsDateString()
  periodEnd?: string;
}

export class CreateInvoiceDto {
  @IsOptional() @IsString()
  companyId?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsNumber() @Min(0)
  vatRate?: number;

  @IsOptional() @IsString()
  vatMention?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines: InvoiceLineDto[];
}

export class UpdateInvoiceDto extends CreateInvoiceDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsNumber() @Min(0)
  paidAmount?: number;
}

export class CreateInvoiceFromQuoteDto {
  @IsString()
  quoteId: string;

  @IsOptional() @IsDateString()
  dueDate?: string;
}
