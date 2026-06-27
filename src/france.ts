/**
 * Calculs fiscaux — France (barème 2025, revenus 2024).
 * IR (quotient familial + plafonnement + décote), PFU, IS, micro-entrepreneur.
 */

import { round2, round4, taxFromBrackets, Bracket } from "./core.js";
import { loadCountry } from "./loader.js";

const D = () => loadCountry("FR");

export interface ResultatIR {
  impot_avant_decote: number;
  plafonnement_applique: number;
  decote: number;
  impot_net: number;
  taux_moyen: number;
}

/** Impôt sur le revenu d'un foyer. */
export function impotRevenu(
  revenuImposable: number,
  parts = 1,
  couple = false,
): ResultatIR {
  const ir = D().personnes_physiques.impot_revenu;
  const tranches = ir.tranches as Bracket[];
  const baseParts = couple ? 2 : 1;

  let impotReel = taxFromBrackets(revenuImposable / parts, tranches) * parts;

  let plafonnement = 0;
  if (parts > baseParts) {
    const impotBase = taxFromBrackets(revenuImposable / baseParts, tranches) * baseParts;
    const avantage = impotBase - impotReel;
    const nbDemiParts = (parts - baseParts) / 0.5;
    const plafond = nbDemiParts * ir.plafond_demi_part;
    if (avantage > plafond) {
      impotReel = impotBase - plafond;
      plafonnement = avantage - plafond;
    }
  }

  const dec = ir.decote;
  const seuil = couple ? dec.seuil_impot_couple : dec.seuil_impot_seul;
  const montant = couple ? dec.montant_couple : dec.montant_seul;
  let decote = 0;
  if (impotReel < seuil) {
    decote = Math.max(0, montant - dec.taux * impotReel);
  }

  const impotNet = Math.max(0, impotReel - decote);
  return {
    impot_avant_decote: round2(impotReel),
    plafonnement_applique: round2(plafonnement),
    decote: round2(decote),
    impot_net: round2(impotNet),
    taux_moyen: revenuImposable ? round4(impotNet / revenuImposable) : 0,
  };
}

/** Prélèvement forfaitaire unique (flat tax). */
export function pfu(montant: number, annee = 2025) {
  const p = D().personnes_physiques.pfu_flat_tax;
  const taux = annee >= 2026 ? p.taux_total_2026 : p.taux_total;
  const impot = montant * taux;
  return { taux, impot: round2(impot), net: round2(montant - impot) };
}

/** Impôt sur les sociétés (IS). */
export function impotSocietes(benefice: number, tauxReduitEligible = true) {
  const s = D().societes.is;
  const plafond = s.plafond_taux_reduit;
  let impot: number;
  if (tauxReduitEligible && benefice > 0) {
    const partReduite = Math.min(benefice, plafond);
    const partNormale = Math.max(0, benefice - plafond);
    impot = partReduite * s.taux_reduit + partNormale * s.taux_normal;
  } else {
    impot = benefice * s.taux_normal;
  }
  return { impot: round2(impot), taux_effectif: benefice ? round4(impot / benefice) : 0 };
}

export type LienFR =
  | "ligne_directe"
  | "conjoint_pacs"
  | "frere_soeur"
  | "neveu_niece"
  | "tiers";

export interface OptionsSuccessionFR {
  /** Abattement spécifique handicap (+159 325 €, cumulable). */
  handicap?: boolean;
  /** Surcharge manuelle de l'abattement (sinon valeur légale par lien). */
  abattement?: number;
}

/**
 * Droits de succession selon le lien de parenté (barèmes marginaux / taux fixes).
 * - ligne_directe : abattement 100 000 €, barème 5 %→45 %
 * - conjoint_pacs : succession **exonérée**
 * - frere_soeur : abattement 15 932 €, 35 % puis 45 %
 * - neveu_niece : abattement 7 967 €, taux fixe 55 %
 * - tiers : abattement 1 594 €, taux fixe 60 %
 */
export function droitsSuccession(
  montant: number,
  lien: LienFR = "ligne_directe",
  options: OptionsSuccessionFR = {},
) {
  const sd = D().personnes_physiques.succession_donation;
  const ab = sd.abattements;

  if (lien === "conjoint_pacs") {
    return { lien, base_taxable: 0, abattement: "exoneration_totale", impot: 0 };
  }

  const abattementsLegaux: Record<string, number> = {
    ligne_directe: ab.ligne_directe,
    frere_soeur: ab.frere_soeur,
    neveu_niece: ab.neveu_niece,
    tiers: ab.tiers,
  };
  let abattement = options.abattement ?? abattementsLegaux[lien];
  if (options.handicap) abattement += ab.personne_handicapee_supplementaire;

  const taxable = Math.max(0, montant - abattement);
  let impot: number;
  if (lien === "ligne_directe") {
    impot = taxFromBrackets(taxable, sd.bareme_ligne_directe as Bracket[]);
  } else if (lien === "frere_soeur") {
    impot = taxFromBrackets(taxable, sd.bareme_freres_soeurs as Bracket[]);
  } else if (lien === "neveu_niece") {
    impot = taxable * sd.taux_neveux_nieces;
  } else {
    impot = taxable * sd.taux_tiers;
  }

  return { lien, base_taxable: round2(taxable), abattement, impot: round2(impot) };
}

/** Alias rétro-compatible : droits de succession en ligne directe. */
export function droitsLigneDirecte(montant: number, abattement = 100000) {
  const r = droitsSuccession(montant, "ligne_directe", { abattement });
  return { base_taxable: r.base_taxable, abattement, impot: r.impot };
}

export type ActiviteMicro = "vente_bic" | "services_bic" | "bnc_hors_cipav" | "liberal_cipav";

/** Cotisations sociales et (option) versement libératoire d'un micro-entrepreneur. */
export function microEntrepreneur(
  ca: number,
  activite: ActiviteMicro = "services_bic",
  versementLiberatoire = false,
) {
  const m = D().independants.micro_entrepreneur;
  const cotisations = ca * m.cotisations_urssaf[activite];
  const out: Record<string, number> = { cotisations_sociales: round2(cotisations) };

  const mapVL: Record<string, string> = { vente_bic: "vente", services_bic: "services_bic" };
  if (versementLiberatoire) {
    const key = mapVL[activite] ?? "bnc";
    out.versement_liberatoire_ir = round2(ca * m.versement_liberatoire[key]);
  }
  const keyAb = mapVL[activite] ?? "bnc";
  out.benefice_imposable = round2(ca * (1 - m.abattement_forfaitaire_benefice[keyAb]));
  return out;
}
