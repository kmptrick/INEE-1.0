import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreditNoteLineDto {
  @IsOptional() @IsString() serviceId?: string;
  @IsString() description: string;
  @IsNumber() @Min(0) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsOptional() @IsString() unite?: string;
}

export class CreateCreditNoteDto {
  @IsString() invoiceId: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsNumber() @Min(0) vatRate?: number;
  @IsOptional() @IsString() vatMention?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreditNoteLineDto) lines: CreditNoteLineDto[];
}

export class UpdateCreditNoteDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() @Min(0) vatRate?: number;
  @IsOptional() @IsString() vatMention?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreditNoteLineDto) lines?: CreditNoteLineDto[];
}
