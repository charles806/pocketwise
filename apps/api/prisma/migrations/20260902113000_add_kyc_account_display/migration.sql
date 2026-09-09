-- AlterTable
ALTER TABLE "users" ADD COLUMN "bank_name" TEXT,
ADD COLUMN "account_name" TEXT,
ADD COLUMN "show_account_modal" BOOLEAN NOT NULL DEFAULT false;
