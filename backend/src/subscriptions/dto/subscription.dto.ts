import { IsString, IsOptional, IsNumber, IsArray, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionLineDto {
  @IsOptional() @IsString() serviceId?: string;
  @IsString() description: string;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsString() unite?: string;
  @IsOptional() @IsNumber() discountRate?: number;
  @IsOptional() @IsNumber() lineVatRate?: number;
}

export class CreateSubscriptionDto {
  @IsString() companyId: string;
  @IsString() frequency: string; // MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL
  @IsDateString() startDate: string;
  @IsOptional() @IsNumber() vatRate?: number;
  @IsOptional() @IsString() vatMention?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateSubscriptionLineDto)
  lines: CreateSubscriptionLineDto[];
}

export class UpdateSubscriptionDto {
  @IsOptional() @IsString() frequency?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() nextBillingDate?: string;
  @IsOptional() @IsNumber() vatRate?: number;
  @IsOptional() @IsString() vatMention?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateSubscriptionLineDto)
  lines?: CreateSubscriptionLineDto[];
}
