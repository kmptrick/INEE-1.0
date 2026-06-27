import { IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import type { Pays, TypeEntite, CategorieTaille } from '../data/referentiels';

const PAYS = ['LU', 'BE', 'FR', 'DE'] as const;
const TYPES_ENTITE = [
  'SOCIETE_CAPITAUX',
  'SOCIETE_PERSONNES',
  'PERSONNE_PHYSIQUE',
  'PROFESSION_LIBERALE',
  'ASSOCIATION',
] as const;

/** Données financières d'un exercice. */
export class FiguresDto {
  @IsEnum(PAYS) pays!: Pays;
  @IsNumber() @Min(0) bilan!: number;
  @IsNumber() @Min(0) ca!: number;
  @IsNumber() @Min(0) effectif!: number;
}

export class ClassificationDto extends FiguresDto {
  /** Bilan de l'exercice précédent (pour la règle des 2 exercices consécutifs). */
  @IsOptional() @IsNumber() @Min(0) bilanPrecedent?: number;
  @IsOptional() @IsNumber() @Min(0) caPrecedent?: number;
  @IsOptional() @IsNumber() @Min(0) effectifPrecedent?: number;
}

export class TvaDto {
  @IsEnum(PAYS) pays!: Pays;
  @IsNumber() @Min(0) montantHT!: number;
  /** Taux forcé (sinon : taux normal du pays). */
  @IsOptional() @IsNumber() @Min(0) taux?: number;
}

export class FranchiseDto {
  @IsEnum(PAYS) pays!: Pays;
  @IsNumber() @Min(0) ca!: number;
  /** Pour la France : 'VENTE' ou 'SERVICES'. */
  @IsOptional() typeActivite?: 'VENTE' | 'SERVICES';
}

export class AuditDto {
  @IsEnum(PAYS) pays!: Pays;
  @IsNumber() @Min(0) bilan!: number;
  @IsNumber() @Min(0) ca!: number;
  @IsNumber() @Min(0) effectif!: number;
  /** Audit toujours obligatoire (groupe consolidé, EIP, société cotée…). */
  @IsOptional() @IsBoolean() auditToujoursObligatoire?: boolean;
}

export class RegimeDto {
  @IsEnum(PAYS) pays!: Pays;
  @IsEnum(TYPES_ENTITE) typeEntite!: TypeEntite;
  @IsOptional() @IsNumber() @Min(0) ca?: number;
  /** Allemagne : bénéfice annuel (test § 241a HGB). */
  @IsOptional() @IsNumber() beneficeAnnuel?: number;
}

export class DepotDto {
  @IsEnum(PAYS) pays!: Pays;
  @IsOptional() categorie?: CategorieTaille;
  @IsOptional() @IsNumber() @Min(0) bilan?: number;
  @IsOptional() @IsNumber() @Min(0) ca?: number;
  @IsOptional() @IsNumber() @Min(0) effectif?: number;
}
