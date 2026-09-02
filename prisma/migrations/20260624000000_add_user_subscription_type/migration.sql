-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PAID');

-- AlterTable: default PAID so all existing users keep full access
ALTER TABLE "User" ADD COLUMN "subscriptionType" "SubscriptionType" NOT NULL DEFAULT 'PAID';
