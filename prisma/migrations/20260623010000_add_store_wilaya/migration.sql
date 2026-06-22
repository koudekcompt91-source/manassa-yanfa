-- AlterTable: optional wilaya tag on store items (nullable, safe)
ALTER TABLE "StoreItem" ADD COLUMN "wilaya" TEXT;

-- AlterTable: required wilaya on purchase requests (default '' keeps any existing rows valid)
ALTER TABLE "StoreOrder" ADD COLUMN "wilaya" TEXT NOT NULL DEFAULT '';
