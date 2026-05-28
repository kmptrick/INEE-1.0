import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; password: string; firstName: string; lastName: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, isActive: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
