/** Primitives de calcul partagées par tous les pays. */

export interface Bracket {
  min: number;
  max: number | null;
  taux: number;
}

/** Impôt selon un barème **marginal** (chaque tranche taxée à son taux). */
export function taxFromBrackets(base: number, brackets: Bracket[]): number {
  let total = 0;
  for (const b of brackets) {
    const lo = b.min;
    const hi = b.max === null ? Infinity : b.max;
    if (base > lo) {
      total += (Math.min(base, hi) - lo) * b.taux;
    }
  }
  return total;
}

/** Taux marginal applicable à `base`. */
export function marginalRate(base: number, brackets: Bracket[]): number {
  let rate = 0;
  for (const b of brackets) {
    const lo = b.min;
    const hi = b.max === null ? Infinity : b.max;
    if ((lo < base && base <= hi) || (hi === Infinity && base > lo)) {
      rate = b.taux;
    }
  }
  return rate;
}

/** Arrondi à 2 décimales (centime). */
export const round2 = (x: number): number => Math.round((x + 1e-9) * 100) / 100;

/** Arrondi à 4 décimales (pour les taux/ratios). */
export const round4 = (x: number): number => Math.round((x + 1e-12) * 10000) / 10000;
