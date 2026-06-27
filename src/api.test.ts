/** Tests de l'API unifiée `calcule()`. */

import { test } from "node:test";
import assert from "node:assert/strict";

import { calcule } from "./api.js";

const near = (a: number, b: number, delta = 1) =>
  assert.ok(Math.abs(a - b) <= delta, `${a} ≠ ${b} (±${delta})`);

test("API FR particulier (cohérent avec FR-1)", () => {
  const r = calcule({ pays: "FR", profil: { type: "particulier", revenuImposable: 35000 } });
  assert.equal(r.categorie, "particulier");
  near(r.impot, 3665.48);
  assert.ok(r.meta.source.includes("impots.gouv.fr"));
});

test("API FR particulier couple 3 parts (cohérent avec FR-2)", () => {
  const r = calcule({
    pays: "FR",
    profil: { type: "particulier", revenuImposable: 60000, parts: 3, couple: true },
  });
  near(r.impot, 2605.7);
});

test("API BE particulier + additionnels (cohérent avec BE-1)", () => {
  const r = calcule({
    pays: "BE",
    profil: { type: "particulier", revenuImposable: 40000, tauxCommunal: 0.08 },
  });
  near(r.impot, 12423.78);
});

test("API LU particulier classe 2 (cohérent avec LU-2)", () => {
  const r = calcule({ pays: "LU", profil: { type: "particulier", revenuImposable: 100000, classe: "2" } });
  near(r.impot, 15710.38);
});

test("API DE particulier splitting (cohérent avec DE-2)", () => {
  const r = calcule({ pays: "DE", profil: { type: "particulier", revenuImposable: 100000, couple: true } });
  near(r.impot, 21382);
});

test("API capital FR/DE", () => {
  near(calcule({ pays: "FR", profil: { type: "capital", montant: 10000 } }).impot, 3000, 0.5);
  near(calcule({ pays: "DE", profil: { type: "capital", montant: 10000 } }).impot, 2373.75, 0.5);
});

test("API société LU & DE (cohérent avec LU-3 / DE-4)", () => {
  near(calcule({ pays: "LU", profil: { type: "societe", benefice: 300000 } }).impot, 71610);
  near(calcule({ pays: "DE", profil: { type: "societe", benefice: 100000, hebesatz: 4.0 } }).impot, 29825, 0.5);
});

test("API indépendant FR & BE", () => {
  near(
    calcule({ pays: "FR", profil: { type: "independant", ca: 40000, activite: "services_bic" } }).impot,
    8480,
    0.5,
  );
  near(calcule({ pays: "BE", profil: { type: "independant", revenuNet: 50000 } }).impot, 10250);
});

test("API succession FR & DE", () => {
  near(calcule({ pays: "FR", profil: { type: "succession", partNette: 250000 } }).impot, 28194.35, 1);
  near(calcule({ pays: "DE", profil: { type: "succession", partNette: 500000, lien: "enfant" } }).impot, 11000);
});

test("API indépendant LU & DE (désormais implémentés)", () => {
  near(calcule({ pays: "LU", profil: { type: "independant", revenuNet: 60000 } }).impot, 13986.44, 1);
  near(calcule({ pays: "DE", profil: { type: "independant", revenuNet: 60000 } }).impot, 23580);
});

test("API succession LU (exonération ligne directe)", () => {
  const r = calcule({ pays: "LU", profil: { type: "succession", partNette: 100000, lien: "ligne_directe" } });
  assert.equal(r.impot, 0);
});

test("API succession FR frère/sœur & BE Wallonie", () => {
  near(calcule({ pays: "FR", profil: { type: "succession", partNette: 50000, lien: "frere_soeur" } }).impot, 12887.6, 1);
  near(calcule({ pays: "BE", profil: { type: "succession", partNette: 200000, region: "wallonie" } }).impot, 15875, 1);
});
