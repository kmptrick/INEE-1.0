#!/usr/bin/env node
/**
 * Démo CLI du moteur fiscal INEE2.0 (TypeScript).
 *
 *   npm run build && node dist/calc.js fr-ir 60000 --parts 3 --couple
 *   node dist/calc.js be-ipp 40000 --communal 0.08
 *   node dist/calc.js lu-irpp 100000 --classe 2
 *   node dist/calc.js de-est 100000 --couple
 *   node dist/calc.js de-gmbh 100000 --hebesatz 4.9
 */

import * as france from "./france.js";
import * as belgique from "./belgique.js";
import * as luxembourg from "./luxembourg.js";
import * as allemagne from "./allemagne.js";

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}
function has(args: string[], name: string): boolean {
  return args.includes(`--${name}`);
}

function main(): void {
  const [cmd, valueRaw, ...rest] = process.argv.slice(2);
  const value = Number(valueRaw);
  let res: unknown;

  switch (cmd) {
    case "fr-ir":
      res = france.impotRevenu(value, Number(flag(rest, "parts") ?? 1), has(rest, "couple"));
      break;
    case "be-ipp":
      res = belgique.ipp(value, Number(flag(rest, "communal") ?? 0));
      break;
    case "lu-irpp":
      res = luxembourg.irpp(value, (flag(rest, "classe") ?? "1") as "1" | "1a" | "2");
      break;
    case "de-est": {
      const couple = has(rest, "couple");
      const impot = couple ? allemagne.splitting(value) : allemagne.einkommensteuer(value);
      res = { einkommensteuer: impot, soli: allemagne.solidaritaetszuschlag(impot, couple) };
      break;
    }
    case "de-gmbh":
      res = allemagne.gmbh(value, Number(flag(rest, "hebesatz") ?? 4.0));
      break;
    default:
      console.error("Commandes: fr-ir | be-ipp | lu-irpp | de-est | de-gmbh");
      process.exit(1);
  }
  console.log(JSON.stringify(res, null, 2));
}

main();
