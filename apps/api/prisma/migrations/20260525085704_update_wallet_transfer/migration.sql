/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "receiver_wallet_id" UUID,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "sender_wallet_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");
