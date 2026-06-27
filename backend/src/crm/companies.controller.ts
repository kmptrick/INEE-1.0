import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private service: CompaniesService) {}

  @Get()
  findAll(@Query('search') search?: string) { return this.service.findAll(search); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateCompanyDto) { return this.service.create(dto); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) { return this.service.update(id, dto); }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) { return this.service.setActive(id, false); }

  @Patch(':id/activate')
  activate(@Param('id') id: string) { return this.service.setActive(id, true); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
