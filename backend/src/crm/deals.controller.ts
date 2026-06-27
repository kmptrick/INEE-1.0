import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto } from './dto/deal.dto';

@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private service: DealsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get('stats/pipeline')
  getPipelineStats() {
    return this.service.getPipelineStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDealDto, @CurrentUser() user: { sub: string }) {
    return this.service.create(dto, user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
