-- Line extras for quotes
ALTER TABLE "QuoteLine" ADD COLUMN IF NOT EXISTS "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "QuoteLine" ADD COLUMN IF NOT EXISTS "lineVatRate" DOUBLE PRECISION;
ALTER TABLE "QuoteLine" ADD COLUMN IF NOT EXISTS "periodStart" TIMESTAMP(3);
ALTER TABLE "QuoteLine" ADD COLUMN IF NOT EXISTS "periodEnd" TIMESTAMP(3);

-- Line extras for invoices
ALTER TABLE "InvoiceLine" ADD COLUMN IF NOT EXISTS "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "InvoiceLine" ADD COLUMN IF NOT EXISTS "lineVatRate" DOUBLE PRECISION;
ALTER TABLE "InvoiceLine" ADD COLUMN IF NOT EXISTS "periodStart" TIMESTAMP(3);
ALTER TABLE "InvoiceLine" ADD COLUMN IF NOT EXISTS "periodEnd" TIMESTAMP(3);

-- Leave types
CREATE TABLE "LeaveType" (
  "id"             TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "color"          TEXT NOT NULL DEFAULT '#6B7280',
  "maxDaysPerYear" INTEGER NOT NULL DEFAULT 25,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

-- Leave requests
CREATE TYPE "LeaveRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "LeaveRequest" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "leaveTypeId" TEXT NOT NULL,
  "startDate"   TIMESTAMP(3) NOT NULL,
  "endDate"     TIMESTAMP(3) NOT NULL,
  "daysCount"   DOUBLE PRECISION NOT NULL,
  "status"      "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
  "notes"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LeaveRequest"
  ADD CONSTRAINT "LeaveRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeaveRequest"
  ADD CONSTRAINT "LeaveRequest_leaveTypeId_fkey"
  FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default leave types
INSERT INTO "LeaveType" ("id","name","color","maxDaysPerYear","isActive","createdAt")
VALUES
  ('lt_conge_annuel',  'Congé annuel',    '#16A34A', 26, true, NOW()),
  ('lt_maladie',       'Congé maladie',   '#DC2626', 10, true, NOW()),
  ('lt_formation',     'Formation',        '#1D6FD8',  5, true, NOW()),
  ('lt_exceptionnel',  'Congé exceptionnel','#C8803A', 3, true, NOW());
