-- Migration ponctuelle : remplacer le séparateur "/" par "-" dans tous les
-- identifiants du CRM (ex. "Dev / 2026 - 001" -> "Dev - 2026 - 001").
-- Le seul "/" présent est celui qui suit le préfixe, donc un REPLACE simple
-- est sûr. Le WHERE ... LIKE '%/%' rend le script ré-exécutable sans risque.

BEGIN;

UPDATE "Quote"        SET "number"    = REPLACE("number", '/', '-')    WHERE "number"    LIKE '%/%';
UPDATE "Invoice"      SET "number"    = REPLACE("number", '/', '-')    WHERE "number"    LIKE '%/%';
UPDATE "CreditNote"   SET "number"    = REPLACE("number", '/', '-')    WHERE "number"    LIKE '%/%';
UPDATE "Subscription" SET "number"    = REPLACE("number", '/', '-')    WHERE "number"    LIKE '%/%';
UPDATE "Commission"   SET "reference" = REPLACE("reference", '/', '-') WHERE "reference" LIKE '%/%';
UPDATE "Deal"         SET "reference" = REPLACE("reference", '/', '-') WHERE "reference" LIKE '%/%';
UPDATE "Project"      SET "reference" = REPLACE("reference", '/', '-') WHERE "reference" LIKE '%/%';
UPDATE "Contact"      SET "reference" = REPLACE("reference", '/', '-') WHERE "reference" LIKE '%/%';
UPDATE "Company"      SET "reference" = REPLACE("reference", '/', '-') WHERE "reference" LIKE '%/%';

COMMIT;
