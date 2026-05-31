import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, UpdateCommissionDto } from './dto/commission.dto';

@UseGuards(JwtAuthGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private service: CommissionsService) {}

  @Get()        findAll(@Query('status') s?: string) { return this.service.findAll(s); }
  @Get('stats') getStats() { return this.service.getStats(); }
  @Get(':id')   findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateCommissionDto, @Req() req: any) {
    return this.service.create(dto, req.user?.id ?? req.user?.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommissionDto, @Req() req: any) {
    return this.service.update(id, dto, req.user?.id ?? req.user?.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user?.id ?? req.user?.sub);
  }
}
