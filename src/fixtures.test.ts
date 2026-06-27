/**
 * Tests du moteur fiscal (TypeScript) — fixtures de
 * docs/fiscalite/05-exemples-calculs.md.
 *
 * Lancement :  npm test   (compile puis `node --test dist/`)
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import * as france from "./france.js";
import * as belgique from "./belgique.js";
import * as luxembourg from "./luxembourg.js";
import * as allemagne from "./allemagne.js";

const near = (a: number, b: number, delta = 1) =>
  assert.ok(Math.abs(a - b) <= delta, `${a} ≠ ${b} (±${delta})`);

// --- France ---------------------------------------------------------------
test("FR-1 IR célibataire 35000", () => {
  const r = france.impotRevenu(35000, 1, false);
  near(r.impot_net, 3665.48);
  assert.equal(r.decote, 0);
});

test("FR-2 IR couple 3 parts 60000 (quotient + décote)", () => {
  const r = france.impotRevenu(60000, 3, true);
  near(r.impot_avant_decote, 2805.99);
  near(r.decote, 200.29);
  near(r.impot_net, 2605.7);
  assert.equal(r.plafonnement_applique, 0);
});

test("FR-3 PFU", () => {
  near(france.pfu(10000, 2025).impot, 3000, 0.5);
  near(france.pfu(10000, 2026).impot, 3140, 0.5);
});

test("FR-5 IS taux réduit 60000", () => {
  near(france.impotSocietes(60000).impot, 10750, 0.5);
});

test("FR-4 micro-entrepreneur 40000", () => {
  const r = france.microEntrepreneur(40000, "services_bic", true);
  near(r.cotisations_sociales, 8480, 0.5);
  near(r.versement_liberatoire_ir, 680, 0.5);
  near(r.benefice_imposable, 20000, 0.5);
});

// --- Belgique -------------------------------------------------------------
test("BE-1 IPP 40000 + 8% communal", () => {
  const r = belgique.ipp(40000, 0.08);
  near(r.impot_bareme, 14231);
  near(r.reduction_quotite, 2727.5);
  near(r.impot_total, 12423.78);
});

test("BE-2 cotisations indépendant 50000", () => {
  near(belgique.cotisationsIndependant(50000).cotisations_annuelles, 10250);
});

test("BE-3 ISOC PME 80000", () => {
  near(belgique.impotSocietes(80000).impot, 16000, 0.5);
});

// --- Luxembourg -----------------------------------------------------------
test("LU-1 IRPP classe 1 50000", () => {
  const r = luxembourg.irpp(50000, "1");
  near(r.impot_bareme, 7341.3);
  near(r.impot_total, 7855.19);
});

test("LU-2 IRPP classe 2 splitting 100000", () => {
  const r = luxembourg.irpp(100000, "2");
  near(r.impot_bareme, 14682.6);
  near(r.impot_total, 15710.38);
});

test("LU-3 IRC+ICC Luxembourg-Ville 300000", () => {
  const r = luxembourg.ircIcc(300000);
  near(r.charge_totale, 71610);
  near(r.taux_global, 0.2387, 0.001);
});

// --- Allemagne ------------------------------------------------------------
test("DE-1 Einkommensteuer 50000", () => {
  assert.equal(allemagne.einkommensteuer(50000), 10691);
  assert.equal(allemagne.solidaritaetszuschlag(10691), 0);
});

test("DE-2 splitting 100000", () => {
  assert.equal(allemagne.splitting(100000), 21382);
  assert.equal(allemagne.einkommensteuer(100000), 31088);
});

test("DE-3 Abgeltungsteuer 10000", () => {
  near(allemagne.abgeltungsteuer(10000).impot_total, 2373.75, 0.5);
});

test("DE-4 GmbH 100000 Hebesatz 400%", () => {
  const r = allemagne.gmbh(100000, 4.0);
  near(r.charge_totale, 29825, 0.5);
  near(r.taux_effectif, 0.2983, 0.001);
});
