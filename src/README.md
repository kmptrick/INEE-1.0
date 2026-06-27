# Moteur de calcul fiscal — INEE2.0 (TypeScript)

Portage TypeScript/Node.js du moteur fiscal (FR/BE/LU/DE). Les barèmes
proviennent de [`/data/fiscalite/*.json`](../data/fiscalite/) — **source de
vérité unique**, partagée avec l'implémentation Python de référence
([`/engine`](../engine/)).

## Installation & build

```bash
npm install        # installe typescript + @types/node (devDependencies)
npm run build      # compile src/ -> dist/
npm test           # compile puis lance les tests (node --test)
```

## Utilisation (bibliothèque)

```ts
import { france, luxembourg, allemagne } from "inee-fiscalite"; // ou "./dist/index.js"

france.impotRevenu(60000, 3, true);
//   { impot_avant_decote: 2805.99, decote: 200.29, impot_net: 2605.7, ... }

luxembourg.irpp(100000, "2");                 // splitting conjugal (classe 2)
//   { impot_bareme: 14682.6, fonds_pour_emploi: 1027.78, impot_total: 15710.38, ... }

allemagne.gmbh(100000, 4.9);                  // Hebesatz de Munich (490 %)
//   { koerperschaftsteuer: 15000, gewerbesteuer: 17150, charge_totale: 32975, ... }
```

## Utilisation (CLI)

```bash
node dist/calc.js fr-ir 35000 --parts 1
node dist/calc.js be-ipp 40000 --communal 0.08
node dist/calc.js lu-irpp 100000 --classe 2
node dist/calc.js de-est 100000 --couple
node dist/calc.js de-gmbh 100000 --hebesatz 4.9
```

## Structure

```
src/
  loader.ts       chargement des barèmes JSON (cache, résolution auto du chemin)
  core.ts         primitives (barème marginal, arrondis) + type Bracket
  france.ts       impotRevenu, pfu, impotSocietes, microEntrepreneur
  belgique.ts     ipp, cotisationsIndependant, impotSocietes
  luxembourg.ts   irpp, ircIcc
  allemagne.ts    einkommensteuer, splitting, solidaritaetszuschlag, abgeltungsteuer, gmbh
  calc.ts         démo CLI
  index.ts        point d'entrée (réexports)
  fixtures.test.ts  15 tests = exemples de docs/fiscalite/05-exemples-calculs.md
```

## Notes

- **API identique** à la version Python (mêmes entrées/sorties, mêmes montants) :
  les deux moteurs se valident mutuellement sur les mêmes fixtures.
- Fonctions **pures**, typées (`strict: true`). `import.meta.dirname` (Node ≥ 20)
  localise automatiquement `/data/fiscalite`.
- Mêmes **limites connues** que la version Python (voir
  [`/engine/README.md`](../engine/README.md)) : calculs principaux, certains cas
  particuliers/crédits non encore implémentés, à verrouiller sur les textes
  officiels avant production.
