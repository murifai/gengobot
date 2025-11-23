-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CREDITS_80_PERCENT', 'CREDITS_95_PERCENT', 'CREDITS_DEPLETED', 'CREDITS_RENEWED', 'TRIAL_STARTED', 'TRIAL_ENDING_3_DAYS', 'TRIAL_ENDING_1_DAY', 'TRIAL_ENDED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED', 'SYSTEM_ANNOUNCEMENT', 'FEATURE_UPDATE');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
