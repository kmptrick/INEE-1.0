import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString() idPrestation: string;
  @IsString() categorie: string;
  @IsString() description: string;
  @IsNumber() @Min(0) prixHT: number;
  @IsOptional() @IsNumber() @Min(0) vatRate?: number;
  @IsOptional() @IsString() unite?: string;
  @IsOptional() @IsString() remarques?: string;
}

export class UpdateServiceDto {
  @IsOptional() @IsString() idPrestation?: string;
  @IsOptional() @IsString() categorie?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0) prixHT?: number;
  @IsOptional() @IsNumber() @Min(0) vatRate?: number;
  @IsOptional() @IsString() unite?: string;
  @IsOptional() @IsString() remarques?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
