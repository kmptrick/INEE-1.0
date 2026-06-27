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
