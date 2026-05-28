import { IsString, IsOptional, IsEmail, IsUrl, IsArray } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  vatNumber?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsArray()
  tags?: string[];
}

export class UpdateCompanyDto extends CreateCompanyDto {}
