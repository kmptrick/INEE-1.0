import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly svc: SubscriptionsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.svc.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSubscriptionDto, @Req() req: any) {
    return this.svc.create(dto, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.svc.setStatus(id, 'ACTIVE');
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.svc.setStatus(id, 'INACTIVE');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  // ─── Génération des factures dues ─────────────────────────────────────────
  @Post('generate')
  generate() {
    return this.svc.generateDueInvoices();
  }
}
