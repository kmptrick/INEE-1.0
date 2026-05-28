import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private svc: ServicesService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('categorie') categorie?: string) {
    return this.svc.findAll(search, categorie);
  }

  @Get('categories')
  categories() {
    return this.svc.categories();
  }

  @Get('by-id/:idPrestation')
  findByIdPrestation(@Param('idPrestation') idPrestation: string) {
    return this.svc.findByIdPrestation(idPrestation);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.svc.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
