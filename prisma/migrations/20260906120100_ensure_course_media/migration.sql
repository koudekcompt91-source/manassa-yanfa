-- Ensure FREE LMS media tables exist on databases that were previously pushed
-- without a clean PostgreSQL migration history.

CREATE TABLE IF NOT EXISTS "CourseVideo" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseVideo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CourseVideo_courseId_key" ON "CourseVideo"("courseId");
CREATE INDEX IF NOT EXISTS "CourseVideo_courseId_idx" ON "CourseVideo"("courseId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseVideo_courseId_fkey'
  ) THEN
    ALTER TABLE "CourseVideo"
      ADD CONSTRAINT "CourseVideo_courseId_fkey"
      FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "CoursePDF" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoursePDF_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CoursePDF_courseId_order_idx" ON "CoursePDF"("courseId", "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoursePDF_courseId_fkey'
  ) THEN
    ALTER TABLE "CoursePDF"
      ADD CONSTRAINT "CoursePDF_courseId_fkey"
      FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill CourseVideo from legacy Course.videoUrl when present.
INSERT INTO "CourseVideo" ("id", "courseId", "videoUrl", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  c."id",
  c."videoUrl",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Course" c
WHERE c."videoUrl" IS NOT NULL
  AND TRIM(c."videoUrl") <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "CourseVideo" v WHERE v."courseId" = c."id"
  );
