-- AlterTable
ALTER TABLE "users" ADD COLUMN "address_line_1" TEXT,
ADD COLUMN "address_line_2" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "postal_code" TEXT,
ADD COLUMN "country" TEXT DEFAULT 'NG';
