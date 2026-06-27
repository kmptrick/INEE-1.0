#!/usr/bin/env node
/**
 * Serveur HTTP minimal exposant l'API fiscale (node:http, sans dépendance).
 *
 *   npm run build && node dist/server.js
 *   curl -s localhost:3000/calcule -d '{"pays":"FR","profil":{"type":"particulier","revenuImposable":35000}}'
 *
 * À remplacer/intégrer dans le framework HTTP réel d'INEE2.0 (Express, Fastify…).
 */

import { createServer } from "node:http";
import { calcule, CalculInput } from "./api.js";

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/calcule") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const input = JSON.parse(body) as CalculInput;
        const result = calcule(input);
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
    });
  } else {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "POST /calcule uniquement" }));
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`INEE fiscalité — API sur http://localhost:${port}/calcule`);
});
