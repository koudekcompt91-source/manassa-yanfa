-- Course.minSubscription: FREE = visible to FREE+PAID; PAID = paid subscribers only.
-- Default FREE, then backfill paid-priced courses to PAID so free accounts stay correctly gated.
ALTER TABLE "Course" ADD COLUMN "minSubscription" "SubscriptionType" NOT NULL DEFAULT 'FREE';

UPDATE "Course" SET "minSubscription" = 'PAID' WHERE "accessType" = 'PAID';

CREATE INDEX "Course_status_minSubscription_idx" ON "Course"("status", "minSubscription");
