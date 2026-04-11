-- AlterTable: additive column for existing SQLite DBs
ALTER TABLE "User" ADD COLUMN "level" TEXT NOT NULL DEFAULT 'unknown';
