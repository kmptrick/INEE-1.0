/** Tests : CSSS belge, successions FR (toutes parentés + handicap),
 *  majoration successorale LU (points vérifiés + exonérations). */

import { test } from "node:test";
import assert from "node:assert/strict";

import * as france from "./france.js";
import * as belgique from "./belgique.js";
import * as luxembourg from "./luxembourg.js";

const near = (a: number, b: number, delta = 0.5) =>
  assert.ok(Math.abs(a - b) <= delta, `${a} ≠ ${b} (±${delta})`);

// --- Belgique : cotisation spéciale sécurité sociale (CSSS) ----------------
test("BE CSSS — sous le seuil = 0", () => {
  assert.equal(belgique.cotisationSpecialeSecu(15000).cotisation, 0);
});
test("BE CSSS — tranche 1,3 %", () => {
  near(belgique.cotisationSpecialeSecu(50000).cotisation, 599.18); // 223.10 + 1.3%×(50000−21070.96)
});
test("BE CSSS — maximum 731,28 €", () => {
  assert.equal(belgique.cotisationSpecialeSecu(70000).cotisation, 731.28);
});

// --- France : successions par lien de parenté ------------------------------
test("FR succession ligne directe (enfant) 250000", () => {
  near(france.droitsSuccession(250000, "ligne_directe").impot, 28194.35, 1);
});
test("FR succession frère/sœur 50000", () => {
  near(france.droitsSuccession(50000, "frere_soeur").impot, 12887.6, 1); // 35%/45% après abatt. 15932
});
test("FR succession neveu/nièce 50000 (taux 55 %)", () => {
  near(france.droitsSuccession(50000, "neveu_niece").impot, 23118.15, 1); // (50000−7967)×0.55
});
test("FR succession tiers 50000 (taux 60 %)", () => {
  near(france.droitsSuccession(50000, "tiers").impot, 29043.6, 1); // (50000−1594)×0.60
});
test("FR succession conjoint/PACS = exonérée", () => {
  assert.equal(france.droitsSuccession(500000, "conjoint_pacs").impot, 0);
});
test("FR succession handicap (abattement +159 325) annule l'impôt", () => {
  assert.equal(france.droitsSuccession(250000, "ligne_directe", { handicap: true }).impot, 0);
});

// --- Luxembourg : majoration successorale (points vérifiés) ----------------
test("LU majoration — points vérifiés (120k→0.7, 240k→0.9, 550k→1.4)", () => {
  assert.equal(luxembourg.majorationSuccession(120000), 0.7);
  assert.equal(luxembourg.majorationSuccession(240000), 0.9);
  assert.equal(luxembourg.majorationSuccession(550000), 1.4);
});
test("LU majoration — bandes basses", () => {
  assert.equal(luxembourg.majorationSuccession(5000), 0);
  assert.equal(luxembourg.majorationSuccession(25000), 0.2);
});
test("LU succession — exonérations", () => {
  assert.equal(luxembourg.droitsSuccession(300000, "ligne_directe").impot, 0);
  assert.equal(luxembourg.droitsSuccession(300000, "conjoint_enfants_communs").impot, 0);
});
