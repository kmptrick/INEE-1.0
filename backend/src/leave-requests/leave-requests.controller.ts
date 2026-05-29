import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private service: LeaveRequestsService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: { sub: string; role: string },
  ) {
    // All authenticated users can view any user's leaves; default to own if no userId given
    const filteredUserId = userId ?? user?.sub;
    return this.service.findAll(filteredUserId, status);
  }

  @Get('my')
  findMine(@CurrentUser() user: { sub: string }) {
    return this.service.findMine(user.sub);
  }

  @Post()
  create(
    @Body() dto: { leaveTypeId: string; startDate: string; endDate: string; daysCount: number; notes?: string },
    @CurrentUser() user: { sub: string },
  ) {
    return this.service.create(user.sub, dto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.service.updateStatus(id, 'APPROVED'); }

  @Patch(':id/reject')
  reject(@Param('id') id: string) { return this.service.updateStatus(id, 'REJECTED'); }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.service.remove(id, user.sub, user.role);
  }
}
