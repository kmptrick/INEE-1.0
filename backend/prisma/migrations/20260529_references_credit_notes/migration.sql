-- Add reference fields to entities
ALTER TABLE "Company"  ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Contact"  ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Deal"     ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Project"  ADD COLUMN IF NOT EXISTS "reference" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Company_reference_key"  ON "Company"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "Contact_reference_key"  ON "Contact"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "Deal_reference_key"     ON "Deal"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "Project_reference_key"  ON "Project"("reference");

-- CreditNote
CREATE TYPE "CreditNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

CREATE TABLE "CreditNote" (
    "id"          TEXT NOT NULL,
    "number"      TEXT NOT NULL,
    "status"      "CreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId"   TEXT NOT NULL,
    "companyId"   TEXT,
    "createdById" TEXT,
    "subtotal"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatRate"     DOUBLE PRECISION NOT NULL DEFAULT 17,
    "vatAmount"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatMention"  TEXT,
    "notes"       TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditNote_number_key" ON "CreditNote"("number");

CREATE TABLE "CreditNoteLine" (
    "id"           TEXT NOT NULL,
    "creditNoteId" TEXT NOT NULL,
    "serviceId"    TEXT,
    "description"  TEXT NOT NULL,
    "quantity"     DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice"    DOUBLE PRECISION NOT NULL,
    "unite"        TEXT,
    "total"        DOUBLE PRECISION NOT NULL,
    CONSTRAINT "CreditNoteLine_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CreditNote"
    ADD CONSTRAINT "CreditNote_invoiceId_fkey"   FOREIGN KEY ("invoiceId")   REFERENCES "Invoice"("id")  ON DELETE RESTRICT  ON UPDATE CASCADE,
    ADD CONSTRAINT "CreditNote_companyId_fkey"   FOREIGN KEY ("companyId")   REFERENCES "Company"("id")  ON DELETE SET NULL  ON UPDATE CASCADE,
    ADD CONSTRAINT "CreditNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")     ON DELETE SET NULL  ON UPDATE CASCADE;

ALTER TABLE "CreditNoteLine"
    ADD CONSTRAINT "CreditNoteLine_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "CreditNote"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "CreditNoteLine_serviceId_fkey"    FOREIGN KEY ("serviceId")    REFERENCES "Service"("id")    ON DELETE SET NULL ON UPDATE CASCADE;
