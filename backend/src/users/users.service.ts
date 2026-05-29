import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true,
  username: true, jobTitle: true, birthDate: true,
  role: true, isActive: true, createdAt: true,
} as const;

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
    });
  }

  async create(data: { email: string; password: string; firstName: string; lastName: string; username?: string; jobTitle?: string; birthDate?: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email déjà utilisé');
    const hashed = await bcrypt.hash(data.password, 12);
    const payload: any = { ...data, password: hashed };
    if (data.birthDate) payload.birthDate = new Date(data.birthDate);
    return this.prisma.user.create({ data: payload, select: USER_SELECT });
  }

  async createWithTempPassword(data: { email: string; firstName: string; lastName: string; username?: string; jobTitle?: string; birthDate?: string; role?: string }) {
    const tempPassword = generateTempPassword();
    const user = await this.create({ ...data, password: tempPassword });

    await this.mail.sendSystem({
      to: data.email,
      subject: 'Votre accès INEE',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;color:#1A1008">
          <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
            <h1 style="color:#C8803A;margin:0;font-size:22px;letter-spacing:3px">INEE</h1>
          </div>
          <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
            <p>Bonjour <strong>${data.firstName} ${data.lastName}</strong>,</p>
            <p>Un compte a été créé pour vous sur la plateforme INEE.</p>
            <div style="background:#F5EDE4;border-radius:6px;padding:12px 16px;margin:16px 0">
              <p style="margin:0 0 4px;color:#7A6050;font-size:12px">Email</p>
              <p style="margin:0;font-weight:bold">${data.email}</p>
              <p style="margin:12px 0 4px;color:#7A6050;font-size:12px">Mot de passe temporaire</p>
              <p style="margin:0;font-weight:bold;font-size:18px;letter-spacing:2px;color:#C8803A">${tempPassword}</p>
            </div>
            <p style="color:#DC2626;font-size:13px">Veuillez changer votre mot de passe dès votre première connexion.</p>
          </div>
        </div>`,
    });

    return user;
  }

  async update(id: string, data: { firstName?: string; lastName?: string; username?: string; jobTitle?: string; birthDate?: string; role?: string; email?: string }) {
    const payload: any = { ...data };
    if (data.birthDate) payload.birthDate = new Date(data.birthDate);
    else if (data.birthDate === '') payload.birthDate = null;
    return this.prisma.user.update({ where: { id }, data: payload, select: USER_SELECT });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Utilisateur supprimé' };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async changePassword(requesterId: string, requesterRole: string, targetId: string, oldPassword: string | null, newPassword: string) {
    const isSelf = requesterId === targetId;
    const isAdmin = requesterRole === 'ADMIN';

    if (!isSelf && !isAdmin) throw new ForbiddenException('Non autorisé');

    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Self must provide old password; admin can skip it
    if (isSelf && !isAdmin) {
      if (!oldPassword) throw new ForbiddenException('Ancien mot de passe requis');
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) throw new ForbiddenException('Ancien mot de passe incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: targetId }, data: { password: hashed, loginAttempts: 0, lockedUntil: null } });
    return { message: 'Mot de passe mis à jour' };
  }

  async resetPassword(targetId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId }, select: { email: true, firstName: true, lastName: true } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 12);
    await this.prisma.user.update({ where: { id: targetId }, data: { password: hashed } });

    await this.mail.sendSystem({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe INEE',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;color:#1A1008">
          <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
            <h1 style="color:#C8803A;margin:0;font-size:22px;letter-spacing:3px">INEE</h1>
          </div>
          <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
            <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>Votre mot de passe a été réinitialisé par un administrateur.</p>
            <div style="background:#F5EDE4;border-radius:6px;padding:12px 16px;margin:16px 0">
              <p style="margin:0 0 4px;color:#7A6050;font-size:12px">Nouveau mot de passe temporaire</p>
              <p style="margin:0;font-weight:bold;font-size:18px;letter-spacing:2px;color:#C8803A">${tempPassword}</p>
            </div>
            <p style="color:#DC2626;font-size:13px">Veuillez changer ce mot de passe dès votre prochaine connexion.</p>
          </div>
        </div>`,
    });

    return { message: 'Mot de passe réinitialisé et envoyé par email' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success to avoid user enumeration
    if (!user || !user.isActive) return { message: 'Si cet email existe, un lien a été envoyé.' };

    // Invalidate previous tokens
    await this.prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } } as any);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await (this.prisma as any).passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

    const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}`;

    await this.mail.sendSystem({
      to: email,
      subject: 'Réinitialisation de votre mot de passe INEE',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;color:#1A1008">
          <div style="background:#1A1008;padding:20px 30px;border-radius:8px 8px 0 0">
            <h1 style="color:#C8803A;margin:0;font-size:22px;letter-spacing:3px">INEE</h1>
          </div>
          <div style="background:#fff;padding:24px 30px;border:1px solid #E8DDD5;border-top:none;border-radius:0 0 8px 8px">
            <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p style="margin:24px 0">
              <a href="${link}" style="display:inline-block;background:#C8803A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
                Réinitialiser mon mot de passe →
              </a>
            </p>
            <p style="color:#7A6050;font-size:12px">Ce lien expire dans 2 heures. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            <p style="color:#AAA;font-size:11px;word-break:break-all">Lien : ${link}</p>
          </div>
        </div>`,
    });

    return { message: 'Si cet email existe, un lien a été envoyé.' };
  }

  async resetPasswordWithToken(token: string, newPassword: string) {
    const record = await (this.prisma as any).passwordResetToken.findUnique({ where: { token } });
    if (!record || record.used || new Date(record.expiresAt) < new Date()) {
      throw new BadRequestException('Ce lien est invalide ou a expiré.');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: record.userId }, data: { password: hashed, loginAttempts: 0, lockedUntil: null } });
    await (this.prisma as any).passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

    return { message: 'Mot de passe mis à jour. Vous pouvez maintenant vous connecter.' };
  }

  async setActive(targetId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.update({ where: { id: targetId }, data: { isActive }, select: USER_SELECT });
  }
}
