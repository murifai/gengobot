/*
  Warnings:

  - You are about to drop the column `xenditCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `xenditRecurringId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "xenditCustomerId",
DROP COLUMN "xenditRecurringId",
ADD COLUMN     "paymentCustomerId" TEXT,
ADD COLUMN     "paymentRecurringId" TEXT;
