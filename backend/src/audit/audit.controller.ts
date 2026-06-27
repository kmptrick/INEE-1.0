import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private svc: AuditService) {}

  @Get()
  find(@Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return this.svc.findByEntity(entityType, entityId);
  }
}
