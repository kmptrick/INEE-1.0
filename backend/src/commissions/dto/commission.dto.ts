import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';

export class CreateCommissionDto {
  @IsString()
  brokerName: string;

  @IsOptional() @IsString()
  brokerId?: string;

  @IsOptional() @IsString()
  companyId?: string;

  @IsNumber() @Min(0)
  dealValue: number;

  @IsNumber() @Min(0) @Max(100)
  commissionRate: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsDateString()
  paymentDate?: string;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateCommissionDto extends CreateCommissionDto {
  @IsOptional() @IsEnum(['PENDING', 'APPROVED', 'PAID', 'CANCELLED'])
  status?: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
}
