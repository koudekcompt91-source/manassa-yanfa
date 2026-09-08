-- Additive only: optional PDF attachment fields on Assessment (homework file).
-- Does not modify or drop existing columns or tables.

ALTER TABLE "Assessment" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "fileName" TEXT;
