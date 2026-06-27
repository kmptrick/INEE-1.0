import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComptabiliteService } from './comptabilite.service';
import {
  ClassificationDto,
  TvaDto,
  FranchiseDto,
  AuditDto,
  RegimeDto,
  DepotDto,
} from './dto/comptabilite.dto';

@Controller('comptabilite')
@UseGuards(JwtAuthGuard)
export class ComptabiliteController {
  constructor(private svc: ComptabiliteService) {}

  /** Référentiels bruts (seuils, taux…) pour alimenter l'UI. */
  @Get('referentiels')
  referentiels() {
    return this.svc.referentiels();
  }

  /** Classification micro / petite / moyenne / grande. */
  @Post('classification')
  classification(@Body() dto: ClassificationDto) {
    return this.svc.classifierTaille(dto);
  }

  /** Calcul de TVA sur un montant HT. */
  @Post('tva')
  tva(@Body() dto: TvaDto) {
    return this.svc.calculerTva(dto);
  }

  /** Éligibilité à la franchise de TVA (national + régime UE). */
  @Post('franchise')
  franchise(@Body() dto: FranchiseDto) {
    return this.svc.eligibiliteFranchise(dto);
  }

  /** Audit légal obligatoire ou non. */
  @Post('audit')
  audit(@Body() dto: AuditDto) {
    return this.svc.determinerAudit(dto);
  }

  /** Régime comptable applicable (partie double / simplifié / EÜR / micro…). */
  @Post('regime')
  regime(@Body() dto: RegimeDto) {
    return this.svc.determinerRegime(dto);
  }

  /** Obligations de dépôt des comptes annuels. */
  @Post('depot')
  depot(@Body() dto: DepotDto) {
    return this.svc.obligationsDepot(dto);
  }
}
