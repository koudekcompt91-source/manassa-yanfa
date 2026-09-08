-- Additive only: PaidFileContentType + PaidFileContent for PAID file hub sections.
-- Does not modify or drop existing FREE/PAID tables or columns.

CREATE TYPE "PaidFileContentType" AS ENUM ('SUMMARY', 'ASSIGNMENT', 'EXAM', 'LIBRARY');

CREATE TABLE "PaidFileContent" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "contentType" "PaidFileContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "subject" TEXT,
    "level" TEXT,
    "academicLevel" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaidFileContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaidFileContent_courseId_contentType_order_idx" ON "PaidFileContent"("courseId", "contentType", "order");

CREATE INDEX "PaidFileContent_courseId_contentType_isPublished_idx" ON "PaidFileContent"("courseId", "contentType", "isPublished");

CREATE INDEX "PaidFileContent_contentType_isPublished_level_idx" ON "PaidFileContent"("contentType", "isPublished", "level");

CREATE INDEX "PaidFileContent_isPublished_createdAt_idx" ON "PaidFileContent"("isPublished", "createdAt");

ALTER TABLE "PaidFileContent" ADD CONSTRAINT "PaidFileContent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
