import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreditNotesService } from './credit-notes.service';
import { CreateCreditNoteDto, UpdateCreditNoteDto } from './dto/credit-note.dto';

@UseGuards(JwtAuthGuard)
@Controller('credit-notes')
export class CreditNotesController {
  constructor(private service: CreditNotesService) {}

  @Get()
  findAll(@Query('status') status?: string) { return this.service.findAll(status); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateCreditNoteDto, @CurrentUser() user: { sub: string }) {
    return this.service.create(dto, user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCreditNoteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
