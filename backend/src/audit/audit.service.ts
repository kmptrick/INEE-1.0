import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditParams {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  details?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: AuditParams) {
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          entityType: params.entityType,
          entityId:   params.entityId,
          action:     params.action,
          userId:     params.userId ?? null,
          details:    params.details ?? null,
        },
      });
    } catch {
      // Ne pas bloquer si l'audit échoue
    }
  }

  findByEntity(entityType: string, entityId: string) {
    return (this.prisma as any).auditLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
