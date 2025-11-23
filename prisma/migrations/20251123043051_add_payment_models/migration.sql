-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "PendingPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "invoiceUrl" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentChannel" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInvoice" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingPayment_externalId_key" ON "PendingPayment"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingPayment_invoiceId_key" ON "PendingPayment"("invoiceId");

-- CreateIndex
CREATE INDEX "PendingPayment_userId_idx" ON "PendingPayment"("userId");

-- CreateIndex
CREATE INDEX "PendingPayment_status_idx" ON "PendingPayment"("status");

-- CreateIndex
CREATE INDEX "PendingPayment_externalId_idx" ON "PendingPayment"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInvoice_invoiceId_key" ON "MockInvoice"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInvoice_externalId_key" ON "MockInvoice"("externalId");

-- CreateIndex
CREATE INDEX "MockInvoice_invoiceId_idx" ON "MockInvoice"("invoiceId");

-- CreateIndex
CREATE INDEX "MockInvoice_externalId_idx" ON "MockInvoice"("externalId");

-- AddForeignKey
ALTER TABLE "PendingPayment" ADD CONSTRAINT "PendingPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
