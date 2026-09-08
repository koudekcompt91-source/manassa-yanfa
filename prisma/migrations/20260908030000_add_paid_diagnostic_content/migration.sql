-- Additive only: PaidDiagnosticContent for PAID diagnostic hub section.
-- Does not modify or drop existing FREE/PAID tables or columns.

CREATE TABLE "PaidDiagnosticContent" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "subject" TEXT,
    "level" TEXT,
    "academicLevel" TEXT,
    "fileUrl" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaidDiagnosticContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaidDiagnosticContent_courseId_order_idx" ON "PaidDiagnosticContent"("courseId", "order");

CREATE INDEX "PaidDiagnosticContent_courseId_isPublished_idx" ON "PaidDiagnosticContent"("courseId", "isPublished");

CREATE INDEX "PaidDiagnosticContent_isPublished_level_idx" ON "PaidDiagnosticContent"("isPublished", "level");

ALTER TABLE "PaidDiagnosticContent" ADD CONSTRAINT "PaidDiagnosticContent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
