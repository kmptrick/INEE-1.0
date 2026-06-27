/**
 * Calculs fiscaux — Belgique (revenus 2025 / EI 2026).
 * IPP (barème + quotité + additionnels communaux), cotisations indépendant, ISOC.
 */

import { round2, round4, taxFromBrackets, Bracket } from "./core.js";
import { loadCountry } from "./loader.js";

const D = () => loadCountry("BE");

/** Impôt des personnes physiques. */
export function ipp(revenuImposable: number, tauxCommunal = 0) {
  const p = D().personnes_physiques.impot_revenu_ipp;
  const tranches = p.tranches as Bracket[];
  const impotBareme = taxFromBrackets(revenuImposable, tranches);

  const tauxBase = tranches[0].taux;
  const reductionQuotite = p.quotite_exemptee_base * tauxBase;
  const impotApresQuotite = Math.max(0, impotBareme - reductionQuotite);

  const additionnels = impotApresQuotite * tauxCommunal;
  return {
    impot_bareme: round2(impotBareme),
    reduction_quotite: round2(reductionQuotite),
    impot_apres_quotite: round2(impotApresQuotite),
    additionnels_communaux: round2(additionnels),
    impot_total: round2(impotApresQuotite + additionnels),
  };
}

/**
 * Cotisation spéciale pour la sécurité sociale (CSSS) — barème annuel figé,
 * sur le revenu imposable du ménage. Barème « isolé » (la variante ménage à
 * deux revenus atteint le maximum plus haut). En suppression progressive.
 */
export function cotisationSpecialeSecu(revenuMenage: number) {
  const cfg = D().personnes_physiques.cotisation_speciale_secu;
  let montant = 0;
  for (const t of cfg.tranches) {
    const max = t.max === null ? Infinity : t.max;
    if (revenuMenage > t.min) {
      montant = t.base + (Math.min(revenuMenage, max) - t.min) * t.taux;
    }
  }
  return { cotisation: round2(Math.min(montant, cfg.maximum)) };
}

export type RegionBE = "flandre" | "wallonie" | "bruxelles";

/**
 * Droits de succession en **ligne directe** (barème régional marginal).
 * Abattement par défaut (ligne directe) : Wallonie 12 500 € (25 000 € si part
 * < 125 000 €), Bruxelles 15 000 €, Flandre 0 € (régime simplifié).
 */
export function droitsSuccessionLigneDirecte(
  partNette: number,
  region: RegionBE = "wallonie",
  abattement?: number,
) {
  const sd = D().personnes_physiques.succession_ligne_directe;
  const brackets = sd[region] as Bracket[];

  let ab = abattement;
  if (ab === undefined) {
    if (region === "wallonie") ab = partNette < 125000 ? 25000 : 12500;
    else if (region === "bruxelles") ab = 15000;
    else ab = 0;
  }

  const taxable = Math.max(0, partNette - ab);
  return {
    region,
    base_taxable: round2(taxable),
    abattement: ab,
    impot: round2(taxFromBrackets(taxable, brackets)),
  };
}

/** Cotisations sociales INASTI (titre principal), par paliers. */
export function cotisationsIndependant(revenuNet: number) {
  const paliers = D().independants.cotisations_inasti.paliers as Bracket[];
  const cot = taxFromBrackets(revenuNet, paliers);
  return {
    cotisations_annuelles: round2(cot),
    cotisations_trimestrielles: round2(cot / 4),
  };
}

/** Précompte mobilier (dividendes/intérêts). Taux par défaut = régime général (30 %). */
export function precompteMobilier(montant: number, taux?: number) {
  const p = D().personnes_physiques.precompte_mobilier;
  const t = taux ?? p.dividendes_general;
  const impot = montant * t;
  return { taux: t, impot: round2(impot), net: round2(montant - impot) };
}

/** Impôt des sociétés (ISOC). */
export function impotSocietes(benefice: number, pmeTauxReduit = true) {
  const s = D().societes.isoc;
  const plafond = s.plafond_taux_reduit;
  let impot: number;
  if (pmeTauxReduit && benefice > 0) {
    const partReduite = Math.min(benefice, plafond);
    const partNormale = Math.max(0, benefice - plafond);
    impot = partReduite * s.taux_reduit + partNormale * s.taux_normal;
  } else {
    impot = benefice * s.taux_normal;
  }
  return { impot: round2(impot), taux_effectif: benefice ? round4(impot / benefice) : 0 };
}
