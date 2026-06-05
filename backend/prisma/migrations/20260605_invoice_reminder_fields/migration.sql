-- Ajout des champs de suivi des rappels sur Invoice
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "reminderLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "lastReminderAt" TIMESTAMP(3);
