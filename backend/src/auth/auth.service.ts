import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

const MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('ACCOUNT_LOCKED');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const attempts = (user.loginAttempts ?? 0) + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: locked ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) : null,
        },
      });
      if (locked) throw new UnauthorizedException('ACCOUNT_LOCKED');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset on success
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const user = await this.users.create(data);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }
}
