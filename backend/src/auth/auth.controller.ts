import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.users.findById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Body() dto: { oldPassword?: string; newPassword: string },
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.users.changePassword(user.sub, user.role, user.sub, dto.oldPassword ?? null, dto.newPassword);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: { email: string }) {
    return this.users.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: { token: string; newPassword: string }) {
    return this.users.resetPasswordWithToken(dto.token, dto.newPassword);
  }
}
