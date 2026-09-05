-- Learning system isolation + FREE LMS video URL
-- Default PAID so existing courses stay in the paid platform.
ALTER TABLE "Course" ADD COLUMN "system" "SubscriptionType" NOT NULL DEFAULT 'PAID';
ALTER TABLE "Course" ADD COLUMN "videoUrl" TEXT;

CREATE INDEX "Course_system_status_order_idx" ON "Course"("system", "status", "order");
