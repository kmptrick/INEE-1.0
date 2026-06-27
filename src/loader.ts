/** Chargement des barèmes fiscaux depuis /data/fiscalite/*.json. */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** Données d'un pays (structure JSON libre — voir data/fiscalite/README.md). */
export type CountryData = Record<string, any>;

const FILES: Record<string, string> = {
  FR: "fr-2025.json",
  BE: "be-2025.json",
  LU: "lu-2025.json",
  DE: "de-2025.json",
};

function findDataDir(): string {
  // Remonte depuis le dossier du module compilé jusqu'à trouver data/fiscalite
  let dir = import.meta.dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, "data", "fiscalite");
    if (existsSync(candidate)) return candidate;
    dir = dirname(dir);
  }
  throw new Error("Dossier data/fiscalite introuvable");
}

export const DATA_DIR = findDataDir();

const cache = new Map<string, CountryData>();

/** Retourne les barèmes pour un code pays (FR, BE, LU, DE). */
export function loadCountry(code: string): CountryData {
  const key = code.toUpperCase();
  if (!(key in FILES)) {
    throw new Error(`Pays inconnu: ${code} (attendu: ${Object.keys(FILES).join(", ")})`);
  }
  let data = cache.get(key);
  if (!data) {
    data = JSON.parse(readFileSync(join(DATA_DIR, FILES[key]), "utf-8")) as CountryData;
    cache.set(key, data);
  }
  return data;
}
