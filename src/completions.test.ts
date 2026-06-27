/** Tests des calculs complémentaires (Soli zone d'atténuation, crédits LU,
 *  cotisations indépendant LU/DE, droits de succession FR/BE/DE). */

import { test } from "node:test";
import assert from "node:assert/strict";

import * as france from "./france.js";
import * as belgique from "./belgique.js";
import * as luxembourg from "./luxembourg.js";
import * as allemagne from "./allemagne.js";

const near = (a: number, b: number, delta = 0.5) =>
  assert.ok(Math.abs(a - b) <= delta, `${a} ≠ ${b} (±${delta})`);

// --- Allemagne : Soli avec Milderungszone ---------------------------------
test("DE Soli — sous la franchise = 0", () => {
  assert.equal(allemagne.solidaritaetszuschlag(19950), 0);
});
test("DE Soli — zone d'atténuation (11,9 %)", () => {
  near(allemagne.solidaritaetszuschlag(30000), 1195.95); // 0.119 × (30000-19950)
});
test("DE Soli — taux plein (5,5 %)", () => {
  near(allemagne.solidaritaetszuschlag(40000), 2200); // 0.055 × 40000 < milderung
});

// --- Allemagne : Erbschaftsteuer (taux unique de tranche) -----------------
test("DE Erbschaftsteuer enfant 500000", () => {
  const r = allemagne.erbschaftsteuer(500000, "enfant");
  assert.equal(r.base_imposable, 100000); // 500000 - 400000
  assert.equal(r.taux, 0.11); // classe I, ≤ 300000
  near(r.impot, 11000);
});

// --- Allemagne : cotisations indépendant (estimation) ---------------------
test("DE cotisations indépendant 60000", () => {
  near(allemagne.cotisationsIndependant(60000).total, 23580);
});

// --- Luxembourg : crédits d'impôt -----------------------------------------
test("LU CIS", () => {
  near(luxembourg.creditImpotSalarie(50000), 450); // 600 - 10000×0.015
  assert.equal(luxembourg.creditImpotSalarie(30000), 600);
  near(luxembourg.creditImpotSalarie(10000), 562.86);
});
test("LU CIM", () => {
  assert.equal(luxembourg.creditImpotMonoparental(50000), 3504);
  near(luxembourg.creditImpotMonoparental(80000), 2280); // 3504 - 20000×0.0612
  assert.equal(luxembourg.creditImpotMonoparental(110000), 750);
});

// --- Luxembourg : cotisations indépendant ---------------------------------
test("LU cotisations indépendant 60000", () => {
  near(luxembourg.cotisationsIndependant(60000).total, 13986.44, 1);
});

// --- France : droits de succession ligne directe --------------------------
test("FR succession enfant 250000", () => {
  const r = france.droitsLigneDirecte(250000); // abattement 100000
  assert.equal(r.base_taxable, 150000);
  near(r.impot, 28194.35, 1);
});

// --- Belgique : succession Wallonie ---------------------------------------
test("BE succession Wallonie 200000", () => {
  const r = belgique.droitsSuccessionLigneDirecte(200000, "wallonie");
  assert.equal(r.abattement, 12500);
  near(r.impot, 15875, 1);
});
