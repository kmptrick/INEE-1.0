-- Rendre le champ "number" nullable dans Invoice
-- Permet la création de brouillons sans numéro (assigné lors de la comptabilisation)
ALTER TABLE "Invoice" ALTER COLUMN "number" DROP NOT NULL;
