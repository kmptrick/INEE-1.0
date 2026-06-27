/**
 * API unifiée du moteur fiscal INEE2.0.
 *
 * Point d'entrée unique : `calcule({ pays, profil })` dispatche vers le bon
 * calculateur pays et renvoie un résultat normalisé. Conçu pour être branché
 * directement par l'application (back ou front).
 */

import * as france from "./france.js";
import * as belgique from "./belgique.js";
import * as luxembourg from "./luxembourg.js";
import * as allemagne from "./allemagne.js";
import { loadCountry } from "./loader.js";
import { round2 } from "./core.js";

export type Pays = "FR" | "BE" | "LU" | "DE";

/** Personne physique / salarié — impôt sur le revenu. */
export interface ParticulierProfil {
  type: "particulier";
  revenuImposable: number;
  parts?: number; // FR (quotient familial)
  couple?: boolean; // FR & DE (splitting)
  classe?: "1" | "1a" | "2"; // LU (classe d'impôt)
  tauxCommunal?: number; // BE (additionnels communaux, ex. 0.08)
}

/** Revenus du capital (dividendes / plus-values mobilières). */
export interface CapitalProfil {
  type: "capital";
  montant: number;
  couple?: boolean; // DE (Sparer-Pauschbetrag couple)
}

/** Société — impôt sur les bénéfices. */
export interface SocieteProfil {
  type: "societe";
  benefice: number;
  tauxReduitEligible?: boolean; // FR & BE
  multiplicateurCommunal?: number; // LU (ICC, ex. 2.25)
  hebesatz?: number; // DE (Gewerbesteuer, ex. 4.0)
}

/** Indépendant. */
export interface IndependantProfil {
  type: "independant";
  ca?: number; // FR micro-entrepreneur
  activite?: france.ActiviteMicro; // FR
  versementLiberatoire?: boolean; // FR
  revenuNet?: number; // BE (cotisations INASTI)
}

/** Droits de succession. */
export interface SuccessionProfil {
  type: "succession";
  partNette: number;
  /** Lien de parenté (valeurs selon le pays : LienFR / LienDE / LienLU). */
  lien?: string;
  region?: belgique.RegionBE; // BE (flandre / wallonie / bruxelles)
  abattement?: number; // surcharge l'abattement par défaut
  handicap?: boolean; // FR (abattement handicap)
}

export type Profil =
  | ParticulierProfil
  | CapitalProfil
  | SocieteProfil
  | IndependantProfil
  | SuccessionProfil;

export interface CalculInput {
  pays: Pays;
  profil: Profil;
  annee?: number;
}

export interface CalculResult {
  pays: Pays;
  categorie: Profil["type"];
  libelle: string;
  /** Montant principal d'impôt / de charge (€). */
  impot: number;
  /** Résultat détaillé renvoyé par le calculateur sous-jacent. */
  details: Record<string, unknown>;
  meta: { annee: number; source: string; avertissement: string };
}

const AVERTISSEMENT =
  "Calcul indicatif (mécanique principale). À verrouiller sur les textes officiels avant production.";

/** Calcule un impôt à partir d'un pays et d'un profil. */
export function calcule(input: CalculInput): CalculResult {
  const { pays, profil } = input;
  const annee = input.annee ?? 2025;
  const source = loadCountry(pays).source_principale as string;

  let impot = 0;
  let libelle = "";
  let details: Record<string, unknown> = {};

  switch (profil.type) {
    case "particulier": {
      const r = revenuParticulier(pays, profil);
      impot = r.impot;
      libelle = r.libelle;
      details = r.details as unknown as Record<string, unknown>;
      break;
    }
    case "capital": {
      const r = revenuCapital(pays, profil, annee);
      impot = r.impot;
      libelle = r.libelle;
      details = r.details as unknown as Record<string, unknown>;
      break;
    }
    case "societe": {
      const r = impotSociete(pays, profil);
      impot = r.impot;
      libelle = r.libelle;
      details = r.details as unknown as Record<string, unknown>;
      break;
    }
    case "independant": {
      const r = chargesIndependant(pays, profil);
      impot = r.impot;
      libelle = r.libelle;
      details = r.details as unknown as Record<string, unknown>;
      break;
    }
    case "succession": {
      const r = droitsSuccession(pays, profil);
      impot = r.impot;
      libelle = r.libelle;
      details = r.details as unknown as Record<string, unknown>;
      break;
    }
  }

  return {
    pays,
    categorie: profil.type,
    libelle,
    impot: round2(impot),
    details,
    meta: { annee, source, avertissement: AVERTISSEMENT },
  };
}

// --------------------------------------------------------------------------- #
// Dispatch interne
// --------------------------------------------------------------------------- #
function revenuParticulier(pays: Pays, p: ParticulierProfil) {
  switch (pays) {
    case "FR": {
      const d = france.impotRevenu(p.revenuImposable, p.parts ?? 1, p.couple ?? false);
      return { impot: d.impot_net, libelle: "Impôt sur le revenu (IR)", details: d };
    }
    case "BE": {
      const d = belgique.ipp(p.revenuImposable, p.tauxCommunal ?? 0);
      return { impot: d.impot_total, libelle: "Impôt des personnes physiques (IPP)", details: d };
    }
    case "LU": {
      const d = luxembourg.irpp(p.revenuImposable, p.classe ?? "1");
      return { impot: d.impot_total, libelle: "Impôt sur le revenu (IRPP)", details: d };
    }
    case "DE": {
      const couple = p.couple ?? false;
      const est = couple
        ? allemagne.splitting(p.revenuImposable)
        : allemagne.einkommensteuer(p.revenuImposable);
      const soli = allemagne.solidaritaetszuschlag(est, couple);
      return {
        impot: est + soli,
        libelle: "Einkommensteuer (+ Soli)",
        details: { einkommensteuer: est, soli, total: est + soli },
      };
    }
  }
}

function revenuCapital(pays: Pays, p: CapitalProfil, annee: number) {
  switch (pays) {
    case "FR": {
      const d = france.pfu(p.montant, annee);
      return { impot: d.impot, libelle: "PFU / flat tax", details: d };
    }
    case "BE": {
      const d = belgique.precompteMobilier(p.montant);
      return { impot: d.impot, libelle: "Précompte mobilier", details: d };
    }
    case "LU": {
      const d = luxembourg.retenueDividendes(p.montant);
      return { impot: d.impot, libelle: "Retenue à la source dividendes", details: d };
    }
    case "DE": {
      const d = allemagne.abgeltungsteuer(p.montant, p.couple ?? false);
      return { impot: d.impot_total, libelle: "Abgeltungsteuer", details: d };
    }
  }
}

function impotSociete(pays: Pays, p: SocieteProfil) {
  switch (pays) {
    case "FR": {
      const d = france.impotSocietes(p.benefice, p.tauxReduitEligible ?? true);
      return { impot: d.impot, libelle: "Impôt sur les sociétés (IS)", details: d };
    }
    case "BE": {
      const d = belgique.impotSocietes(p.benefice, p.tauxReduitEligible ?? true);
      return { impot: d.impot, libelle: "Impôt des sociétés (ISOC)", details: d };
    }
    case "LU": {
      const d = luxembourg.ircIcc(p.benefice, p.multiplicateurCommunal);
      return { impot: d.charge_totale, libelle: "IRC + ICC", details: d };
    }
    case "DE": {
      const d = allemagne.gmbh(p.benefice, p.hebesatz ?? 4.0);
      return { impot: d.charge_totale, libelle: "KSt + Soli + Gewerbesteuer", details: d };
    }
  }
}

function chargesIndependant(pays: Pays, p: IndependantProfil) {
  switch (pays) {
    case "FR": {
      if (p.ca === undefined) throw new Error("FR indépendant: 'ca' requis");
      const d = france.microEntrepreneur(p.ca, p.activite ?? "services_bic", p.versementLiberatoire ?? false);
      return { impot: d.cotisations_sociales, libelle: "Micro-entrepreneur (cotisations)", details: d };
    }
    case "BE": {
      if (p.revenuNet === undefined) throw new Error("BE indépendant: 'revenuNet' requis");
      const d = belgique.cotisationsIndependant(p.revenuNet);
      return { impot: d.cotisations_annuelles, libelle: "Cotisations INASTI", details: d };
    }
    case "LU": {
      if (p.revenuNet === undefined) throw new Error("LU indépendant: 'revenuNet' requis");
      const d = luxembourg.cotisationsIndependant(p.revenuNet);
      return { impot: d.total, libelle: "Cotisations CCSS", details: d };
    }
    case "DE": {
      if (p.revenuNet === undefined) throw new Error("DE indépendant: 'revenuNet' requis");
      const d = allemagne.cotisationsIndependant(p.revenuNet);
      return { impot: d.total, libelle: "Cotisations sociales (estimation)", details: d };
    }
  }
}

function droitsSuccession(pays: Pays, p: SuccessionProfil) {
  switch (pays) {
    case "FR": {
      const d = france.droitsSuccession(p.partNette, (p.lien ?? "ligne_directe") as france.LienFR, {
        handicap: p.handicap,
        abattement: p.abattement,
      });
      return { impot: d.impot, libelle: "Droits de succession", details: d };
    }
    case "BE": {
      const d = belgique.droitsSuccessionLigneDirecte(p.partNette, p.region ?? "wallonie", p.abattement);
      return { impot: d.impot, libelle: "Droits de succession (ligne directe)", details: d };
    }
    case "DE": {
      const d = allemagne.erbschaftsteuer(p.partNette, (p.lien ?? "enfant") as allemagne.LienDE);
      return { impot: d.impot, libelle: "Erbschaftsteuer", details: d };
    }
    case "LU": {
      const d = luxembourg.droitsSuccession(p.partNette, (p.lien ?? "frere_soeur") as luxembourg.LienLU);
      return { impot: d.impot, libelle: "Droits de succession", details: d };
    }
  }
}
