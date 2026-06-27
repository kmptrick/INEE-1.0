/**
 * Calculs fiscaux — Allemagne (année 2025).
 * Einkommensteuer (formule §32a EStG), splitting, Soli, Abgeltungsteuer, GmbH.
 */

import { round2, round4 } from "./core.js";
import { loadCountry } from "./loader.js";

const D = () => loadCountry("DE");

/**
 * Impôt sur le revenu selon la formule §32a EStG 2025.
 * Le revenu imposable (zvE) et l'impôt sont arrondis à l'euro inférieur.
 */
export function einkommensteuer(zve: number): number {
  const x = Math.floor(zve);
  const g = D().personnes_physiques.impot_revenu_einkommensteuer;
  const gfb = g.grundfreibetrag; // 12 096
  const seuil42 = g.seuil_42pct; // 68 480
  const seuil45 = g.seuil_45pct_reichensteuer; // 277 826

  let est: number;
  if (x <= gfb) {
    est = 0;
  } else if (x <= 17443) {
    const y = (x - gfb) / 10000;
    est = (932.3 * y + 1400) * y;
  } else if (x <= seuil42) {
    const z = (x - 17443) / 10000;
    est = (176.64 * z + 2397) * z + 1015.13;
  } else if (x < seuil45) {
    est = 0.42 * x - 10911.92;
  } else {
    est = 0.45 * x - 19246.67;
  }
  return Math.floor(est);
}

/** Ehegattensplitting : 2 × impôt sur la moitié du revenu commun. */
export function splitting(zveCouple: number): number {
  return 2 * einkommensteuer(zveCouple / 2);
}

/** Solidaritätszuschlag (5,5 %) au-delà de la franchise (sans zone d'atténuation). */
export function solidaritaetszuschlag(impot: number, couple = false): number {
  const s = D().personnes_physiques.solidaritaetszuschlag;
  const freigrenze = couple ? s.freigrenze_couple : s.freigrenze_individuel;
  return impot <= freigrenze ? 0 : round2(impot * s.taux);
}

/** Impôt forfaitaire 25 % sur les revenus du capital (Abgeltungsteuer). */
export function abgeltungsteuer(montant: number, couple = false, tauxKirchensteuer = 0) {
  const a = D().personnes_physiques.abgeltungsteuer;
  const pausch = couple ? a.sparer_pauschbetrag_couple : a.sparer_pauschbetrag;
  const imposable = Math.max(0, montant - pausch);
  const impot = imposable * a.taux;
  const soli = impot * 0.055;
  const kirche = impot * tauxKirchensteuer;
  const total = impot + soli + kirche;
  return {
    base_imposable: round2(imposable),
    abgeltungsteuer: round2(impot),
    soli: round2(soli),
    kirchensteuer: round2(kirche),
    impot_total: round2(total),
    net: round2(montant - total),
  };
}

/** Imposition d'une société de capitaux (GmbH/AG/UG). hebesatz: ex. 4.0 = 400 %. */
export function gmbh(benefice: number, hebesatz = 4.0) {
  const s = D().societes;
  const kstCfg = s.koerperschaftsteuer;
  const gewCfg = s.gewerbesteuer;

  const kst = benefice * kstCfg.taux;
  const soli = kst * 0.055;
  const gewst = benefice * gewCfg.steuermesszahl * hebesatz;
  const total = kst + soli + gewst;
  return {
    koerperschaftsteuer: round2(kst),
    soli: round2(soli),
    gewerbesteuer: round2(gewst),
    charge_totale: round2(total),
    taux_effectif: benefice ? round4(total / benefice) : 0,
  };
}
