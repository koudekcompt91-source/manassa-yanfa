-- Free LMS content type + optional subject (additive only).

CREATE TYPE "FreeContentType" AS ENUM ('LESSON', 'SUMMARY', 'ASSIGNMENT', 'EXAM', 'COURSE');

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "subject" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "freeContentType" "FreeContentType";

-- Existing FREE LMS rows become COURSE so the hub keeps working.
UPDATE "Course"
SET "freeContentType" = 'COURSE'
WHERE "system" = 'FREE' AND "freeContentType" IS NULL;

CREATE INDEX IF NOT EXISTS "Course_system_freeContentType_status_idx"
  ON "Course"("system", "freeContentType", "status");
