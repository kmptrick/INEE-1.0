CREATE TYPE "ClientType" AS ENUM ('SOCIETE', 'PARTICULIER');

ALTER TABLE "Company"
  ADD COLUMN "clientType"     "ClientType" NOT NULL DEFAULT 'SOCIETE',
  ADD COLUMN "denomination"   TEXT,
  ADD COLUMN "formeJuridique" TEXT,
  ADD COLUMN "prenom"         TEXT,
  ADD COLUMN "nom"            TEXT;
