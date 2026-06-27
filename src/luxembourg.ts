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
