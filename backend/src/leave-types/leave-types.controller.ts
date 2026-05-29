import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LeaveTypesService } from './leave-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('leave-types')
export class LeaveTypesController {
  constructor(private service: LeaveTypesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: { name: string; color?: string; maxDaysPerYear?: number }) {
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; color?: string; maxDaysPerYear?: number; isActive?: boolean }) {
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
