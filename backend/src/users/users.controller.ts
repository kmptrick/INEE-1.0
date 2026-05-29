import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

class CreateUserDto {
  @IsEmail() email: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsIn(['ADMIN', 'MANAGER', 'MEMBER']) role?: string;
}

class ChangePasswordDto {
  @IsOptional() @IsString() oldPassword?: string;
  @IsString() @MinLength(8) newPassword: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles('ADMIN')
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto) {
    return this.service.createWithTempPassword(dto);
  }

  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() requester: { sub: string; role: string },
  ) {
    return this.service.changePassword(requester.sub, requester.role, id, dto.oldPassword ?? null, dto.newPassword);
  }

  @Post(':id/reset-password')
  @Roles('ADMIN')
  resetPassword(@Param('id') id: string) {
    return this.service.resetPassword(id);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(@Param('id') id: string) { return this.service.setActive(id, false); }

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(@Param('id') id: string) { return this.service.setActive(id, true); }
}
