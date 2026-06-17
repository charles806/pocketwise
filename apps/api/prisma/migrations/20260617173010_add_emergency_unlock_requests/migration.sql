-- CreateEnum
CREATE TYPE "EmergencyUnlockStatus" AS ENUM ('pending', 'completed');

-- CreateTable
CREATE TABLE "emergency_unlock_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlocks_at" TIMESTAMP(3) NOT NULL,
    "status" "EmergencyUnlockStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "emergency_unlock_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_unlock_requests_user_id_idx" ON "emergency_unlock_requests"("user_id");

-- CreateIndex
CREATE INDEX "emergency_unlock_requests_wallet_id_idx" ON "emergency_unlock_requests"("wallet_id");

-- AddForeignKey
ALTER TABLE "emergency_unlock_requests" ADD CONSTRAINT "emergency_unlock_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_unlock_requests" ADD CONSTRAINT "emergency_unlock_requests_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
