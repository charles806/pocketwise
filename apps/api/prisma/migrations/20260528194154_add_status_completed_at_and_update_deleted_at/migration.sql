/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `savings_goals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "savings_goals" DROP COLUMN "deletedAt",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';
