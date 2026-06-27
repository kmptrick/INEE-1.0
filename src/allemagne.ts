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

/**
 * Solidaritätszuschlag (5,5 %) avec **zone d'atténuation** (Milderungszone).
 * 0 sous la franchise ; au-delà, le Soli croît à 11,9 % de la part dépassant
 * la franchise, plafonné à 5,5 % de l'impôt (taux plein).
 */
export function solidaritaetszuschlag(impot: number, couple = false): number {
  const s = D().personnes_physiques.solidaritaetszuschlag;
  const freigrenze = couple ? s.freigrenze_couple : s.freigrenze_individuel;
  if (impot <= freigrenze) return 0;
  const plein = impot * s.taux; // 5,5 %
  const milderung = (s.milderung_taux ?? 0.119) * (impot - freigrenze);
  return round2(Math.min(plein, milderung));
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

/** Lien de parenté → (classe fiscale, abattement) pour les droits de succession. */
const LIENS_DE = {
  conjoint: { classe: "classe_I", abattement: 500000 },
  enfant: { classe: "classe_I", abattement: 400000 },
  petit_enfant: { classe: "classe_I", abattement: 200000 },
  parent_succession: { classe: "classe_I", abattement: 100000 },
  frere_soeur: { classe: "classe_II", abattement: 20000 },
  neveu_niece: { classe: "classe_II", abattement: 20000 },
  autre: { classe: "classe_III", abattement: 20000 },
} as const;

export type LienDE = keyof typeof LIENS_DE;

/**
 * Droits de succession (Erbschaftsteuer). ⚠️ Le taux s'applique à **toute**
 * l'acquisition imposable (taux unique de la tranche atteinte, pas marginal).
 */
export function erbschaftsteuer(montant: number, lien: LienDE = "enfant") {
  const cfg = LIENS_DE[lien];
  const bareme = D().personnes_physiques.erbschaft_schenkungsteuer.bareme as Array<Record<string, number | null>>;
  const imposable = Math.max(0, montant - cfg.abattement);

  let taux = 0;
  for (const b of bareme) {
    const max = b.max === null ? Infinity : (b.max as number);
    if (imposable <= max) {
      taux = b[cfg.classe] as number;
      break;
    }
  }
  return {
    base_imposable: round2(imposable),
    classe: cfg.classe,
    taux,
    impot: round2(imposable * taux),
  };
}

/**
 * Cotisations sociales d'un indépendant (estimation). En Allemagne, la retraite
 * et la maladie sont en grande partie facultatives/privées pour les indépendants ;
 * ce calcul donne une borne haute « régime légal » plafonnée par les BBG.
 */
export function cotisationsIndependant(revenuAnnuel: number) {
  const c = D().independants.cotisations_sociales;
  const baseKV = Math.min(revenuAnnuel, c.bbg_maladie_an);
  const baseRente = Math.min(revenuAnnuel, c.bbg_retraite_an);
  const kv = baseKV * (c.krankenversicherung_general + c.zusatzbeitrag_moyen);
  const pflege = baseKV * c.pflegeversicherung;
  const rente = baseRente * c.rentenversicherung;
  return {
    krankenversicherung: round2(kv),
    pflegeversicherung: round2(pflege),
    rentenversicherung: round2(rente),
    total: round2(kv + pflege + rente),
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
