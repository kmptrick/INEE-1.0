-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "idPrestation" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prixHT" DOUBLE PRECISION NOT NULL,
    "unite" TEXT,
    "remarques" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_idPrestation_key" ON "Service"("idPrestation");

-- AlterTable QuoteLine
ALTER TABLE "QuoteLine" ADD COLUMN "serviceId" TEXT,
                         ADD COLUMN "unite" TEXT;

-- AlterTable InvoiceLine
ALTER TABLE "InvoiceLine" ADD COLUMN "serviceId" TEXT,
                           ADD COLUMN "unite" TEXT;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
