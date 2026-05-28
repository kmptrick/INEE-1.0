import { IsString, IsOptional, IsEmail, IsArray, IsEnum } from 'class-validator';

export enum ClientType {
  SOCIETE = 'SOCIETE',
  PARTICULIER = 'PARTICULIER',
}

export class CreateCompanyDto {
  @IsOptional() @IsEnum(ClientType)
  clientType?: ClientType;

  @IsOptional() @IsString()
  denomination?: string;

  @IsOptional() @IsString()
  formeJuridique?: string;

  @IsOptional() @IsString()
  prenom?: string;

  @IsOptional() @IsString()
  nom?: string;

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
