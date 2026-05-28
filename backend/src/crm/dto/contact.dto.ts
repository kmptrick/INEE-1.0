import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class CreateContactDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  mobile?: string;

  @IsOptional() @IsString()
  jobTitle?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsArray()
  tags?: string[];

  @IsOptional() @IsString()
  companyId?: string;
}

export class UpdateContactDto extends CreateContactDto {}
