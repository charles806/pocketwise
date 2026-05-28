/*
  Warnings:

  - A unique constraint covering the columns `[anchor_ref]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transactions_anchor_ref_key" ON "transactions"("anchor_ref");
