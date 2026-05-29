import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private service: CalendarService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @CurrentUser() user?: { sub: string; role: string },
  ) {
    // All authenticated users can view any user's calendar; default to own if no userId given
    const filteredUserId = userId ?? user?.sub;
    return this.service.findAll(filteredUserId, start, end);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: { sub: string }) {
    return this.service.create(user.sub, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: { sub: string; role: string }) {
    return this.service.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.service.remove(id, user.sub, user.role);
  }
}
