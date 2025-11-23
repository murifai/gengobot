-- CreateTable
CREATE TABLE "SubscriptionTierConfig" (
    "id" TEXT NOT NULL,
    "name" "SubscriptionTier" NOT NULL,
    "priceMonthly" INTEGER NOT NULL,
    "priceAnnual" INTEGER NOT NULL,
    "features" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionTierConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTierConfig_name_key" ON "SubscriptionTierConfig"("name");

-- CreateIndex
CREATE INDEX "SubscriptionTierConfig_name_idx" ON "SubscriptionTierConfig"("name");

-- CreateIndex
CREATE INDEX "SubscriptionTierConfig_isActive_idx" ON "SubscriptionTierConfig"("isActive");
