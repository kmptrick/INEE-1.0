-- Ajout des champs de suivi des rappels et de langue sur Invoice
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "reminderLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "lastReminderAt" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "lang" TEXT NOT NULL DEFAULT 'fr';
