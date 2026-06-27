import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private svc: ServicesService) {}

  @Get()          findAll(@Query('search') s?: string, @Query('categorie') c?: string) { return this.svc.findAll(s, c); }
  @Get('categories') categories() { return this.svc.categories(); }
  @Get('by-id/:id') findByIdPrestation(@Param('id') id: string) { return this.svc.findByIdPrestation(id); }
  @Get(':id')     findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  create(@Body() dto: CreateServiceDto, @Req() req: any) {
    return this.svc.create(dto, req.user?.id ?? req.user?.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto, @Req() req: any) {
    return this.svc.update(id, dto, req.user?.id ?? req.user?.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.svc.remove(id, req.user?.id ?? req.user?.sub);
  }
}
