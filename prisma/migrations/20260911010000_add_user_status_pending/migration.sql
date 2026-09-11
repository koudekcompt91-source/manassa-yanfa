-- Additive only: add PENDING to UserStatus for manual PAID student activation.
-- Does not drop or alter existing ACTIVE/DISABLED values or User rows.

ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'PENDING';
