/**
 * Moteur de calcul fiscal INEE2.0 (TypeScript) — point d'entrée.
 *
 * Réexporte les calculateurs par pays et les primitives partagées.
 * Les barèmes proviennent de /data/fiscalite/*.json (source unique versionnée).
 */

export * as france from "./france.js";
export * as belgique from "./belgique.js";
export * as luxembourg from "./luxembourg.js";
export * as allemagne from "./allemagne.js";
export { loadCountry, DATA_DIR } from "./loader.js";
export type { Bracket } from "./core.js";
export { taxFromBrackets, marginalRate, round2, round4 } from "./core.js";

// API unifiée (point d'entrée recommandé pour l'application)
export { calcule } from "./api.js";
export type {
  Pays,
  Profil,
  ParticulierProfil,
  CapitalProfil,
  SocieteProfil,
  IndependantProfil,
  SuccessionProfil,
  CalculInput,
  CalculResult,
} from "./api.js";
