DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CourseAccessType') THEN
    CREATE TYPE "CourseAccessType" AS ENUM ('FREE', 'PAID');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CourseStatus') THEN
    CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "Course" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "accessType" "CourseAccessType" NOT NULL DEFAULT 'FREE',
  "price" INTEGER NOT NULL DEFAULT 0,
  "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
  "categoryId" TEXT,
  "teacherId" TEXT,
  "thumbnailUrl" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "academicLevel" TEXT,
  "level" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Course_slug_key" ON "Course"("slug");

CREATE TABLE IF NOT EXISTS "Lesson" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "youtubeUrl" TEXT NOT NULL,
  "youtubeVideoId" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "durationSec" INTEGER,
  "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Lesson_courseId_order_idx" ON "Lesson"("courseId", "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Lesson_courseId_fkey'
  ) THEN
    ALTER TABLE "Lesson"
    ADD CONSTRAINT "Lesson_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;
