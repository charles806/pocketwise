/*
  Warnings:

  - A unique constraint covering the columns `[baas_account_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[baas_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_baas_account_id_key" ON "users"("baas_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_baas_customer_id_key" ON "users"("baas_customer_id");
