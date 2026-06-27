/**
 * Calculs fiscaux — Luxembourg (année d'imposition 2025).
 * IRPP (classes 1/1a/2 avec splitting + fonds pour l'emploi), IRC + ICC.
 */

import { round2, round4, taxFromBrackets, Bracket } from "./core.js";
import { loadCountry } from "./loader.js";

const D = () => loadCountry("LU");

/** Impôt sur le revenu des personnes physiques. */
export function irpp(revenuImposable: number, classe: "1" | "1a" | "2" = "1") {
  const ir = D().personnes_physiques.impot_revenu_irpp;
  const tranches = ir.tranches as Bracket[];

  const impot =
    classe === "2"
      ? taxFromBrackets(revenuImposable / 2, tranches) * 2
      : taxFromBrackets(revenuImposable, tranches);

  const fe = ir.fonds_pour_emploi;
  const seuil = classe === "2" ? fe.seuil_classe_2 : fe.seuil_classe_1_1a;
  const tauxFE = revenuImposable > seuil ? fe.taux_eleve : fe.taux_general;
  const fonds = impot * tauxFE;

  const total = impot + fonds;
  return {
    impot_bareme: round2(impot),
    fonds_pour_emploi: round2(fonds),
    impot_total: round2(total),
    taux_moyen: revenuImposable ? round4(total / revenuImposable) : 0,
  };
}

/**
 * Crédit d'impôt salarié (CIS) — barème 2025 sur le salaire brut annuel.
 * Vaut aussi pour le crédit d'impôt indépendant (CII), même barème sur le bénéfice.
 */
export function creditImpotSalarie(salaireBrut: number): number {
  if (salaireBrut < 936) return 0;
  if (salaireBrut <= 11265) return round2(300 + (salaireBrut - 936) * 0.029);
  if (salaireBrut <= 40000) return D().personnes_physiques.credits_impot.cis_plafond; // 600
  if (salaireBrut < 80000) return round2(Math.max(0, 600 - (salaireBrut - 40000) * 0.015));
  return 0;
}

/** Crédit d'impôt monoparental (CIM) — barème 2025. */
export function creditImpotMonoparental(revenuImposable: number): number {
  const c = D().personnes_physiques.credits_impot;
  if (revenuImposable < 60000) return c.cim_max; // 3504
  if (revenuImposable <= 105000) return round2(c.cim_max - (revenuImposable - 60000) * 0.0612);
  return c.cim_min; // 750
}

/** Crédit d'impôt pensionné (CIP) — forfaitaire. */
export function creditImpotPensionne(): number {
  return D().personnes_physiques.credits_impot.cip; // 300
}

/**
 * Cotisations sociales d'un indépendant (CCSS). Assiette principale (pension +
 * maladie) bornée entre le SSM et 5×SSM ; dépendance sur le revenu après
 * abattement d'1/4 du SSM, sans plafond.
 */
export function cotisationsIndependant(revenuProfessionnel: number) {
  const c = D().independants.cotisations_ccss;
  const minA = c.assiette_min_mois * 12;
  const maxA = c.assiette_max_mois * 12;
  const assiette = Math.min(Math.max(revenuProfessionnel, minA), maxA);

  const pension = assiette * c.pension;
  const maladie = assiette * (c.maladie_soins + c.maladie_especes);
  const dependance = Math.max(0, revenuProfessionnel - 0.25 * minA) * c.dependance;

  return {
    assiette: round2(assiette),
    pension: round2(pension),
    maladie: round2(maladie),
    dependance: round2(dependance),
    total: round2(pension + maladie + dependance),
  };
}

/**
 * Facteur de majoration des droits de succession selon la taille de la part
 * nette (taux effectif = taux_base × (1 + facteur)). Bandes ≤ 250 000 € et
 * points 120 000/240 000/550 000 vérifiés ; bandes 250 000–750 000 à confirmer.
 */
export function majorationSuccession(partNette: number): number {
  const tranches = D().personnes_physiques.succession.majoration_tranches as Array<{
    min: number;
    max: number | null;
    facteur: number;
  }>;
  let facteur = 0;
  for (const t of tranches) {
    const max = t.max === null ? Infinity : t.max;
    if (partNette > t.min && partNette <= max) return t.facteur;
    if (max === Infinity && partNette > t.min) facteur = t.facteur;
  }
  return facteur;
}

export type LienLU =
  | "ligne_directe" // part légale exonérée
  | "conjoint_enfants_communs" // exonéré
  | "frere_soeur"
  | "oncle_neveu"
  | "autre";

/**
 * Droits de succession (modèle simplifié) : exonérations en ligne directe (part
 * légale) et conjoint avec enfants communs ; sinon taux de base × part ×
 * (1 + majoration). ⚠️ Taux de base « au-delà » et bandes hautes de majoration
 * à verrouiller sur pfi.public.lu avant production.
 */
export function droitsSuccession(partNette: number, lien: LienLU = "frere_soeur") {
  const s = D().personnes_physiques.succession;
  if (lien === "ligne_directe" || lien === "conjoint_enfants_communs") {
    return { lien, exonere: true, majoration: 0, impot: 0 };
  }
  const tauxBase =
    lien === "frere_soeur" ? s.freres_soeurs.au_dela : lien === "oncle_neveu" ? s.oncles_neveux.au_dela : 0.15;
  const facteur = partNette > s.majoration_progressive_au_dela ? majorationSuccession(partNette) : 0;
  const impot = partNette * tauxBase * (1 + facteur);
  return { lien, taux_base: tauxBase, majoration: facteur, impot: round2(impot) };
}

/** Retenue à la source sur dividendes (15 %). Hors exonération de 50 % au barème. */
export function retenueDividendes(montant: number) {
  const t = D().personnes_physiques.capitaux_mobiliers.retenue_dividendes;
  const impot = montant * t;
  return { taux: t, impot: round2(impot), net: round2(montant - impot) };
}

/** IRC + impôt commercial communal (ICC). multiplicateurCommunal: ex. 2.25 = Luxembourg-Ville. */
export function ircIcc(benefice: number, multiplicateurCommunal?: number) {
  const s = D().societes;
  const ircCfg = s.irc;
  const iccCfg = s.icc;
  const mult = multiplicateurCommunal ?? iccCfg.multiplicateur_luxembourg_ville;

  let irc: number;
  if (benefice <= ircCfg.taux_pme_plafond_benefice) {
    irc = benefice * ircCfg.taux_pme;
  } else if (benefice > ircCfg.seuil_taux_normal) {
    irc = benefice * ircCfg.taux_normal;
  } else {
    // Zone de lissage : 24 500 € + 30 % de la part > 175 000 €
    irc = 24500 + 0.3 * (benefice - ircCfg.taux_pme_plafond_benefice);
  }

  const fonds = irc * ircCfg.fonds_pour_emploi;
  const icc = benefice * iccCfg.taux_assiette * mult;
  const total = irc + fonds + icc;
  return {
    irc: round2(irc),
    fonds_pour_emploi: round2(fonds),
    icc: round2(icc),
    charge_totale: round2(total),
    taux_global: benefice ? round4(total / benefice) : 0,
  };
}
