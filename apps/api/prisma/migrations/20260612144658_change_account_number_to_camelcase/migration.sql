/*
  Warnings:

  - You are about to drop the column `account_number` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "account_number",
ADD COLUMN     "accountNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_accountNumber_key" ON "users"("accountNumber");
