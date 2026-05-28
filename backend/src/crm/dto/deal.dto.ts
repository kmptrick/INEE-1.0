import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';

export class CreateDealDto {
  @IsString()
  title: string;

  @IsOptional() @IsNumber()
  value?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(100)
  probability?: number;

  @IsOptional() @IsString()
  stageId?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  companyId?: string;

  @IsOptional() @IsDateString()
  expectedCloseDate?: string;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateDealDto extends CreateDealDto {
  @IsOptional() @IsEnum(['OPEN', 'WON', 'LOST'])
  status?: 'OPEN' | 'WON' | 'LOST';
}
