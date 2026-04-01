-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('spend', 'savings', 'emergency', 'flex');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'transfer', 'split_credit', 'fee', 'referral_credit');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('pending', 'credited', 'expired');

-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "kyc_tier" INTEGER NOT NULL DEFAULT 1,
    "is_simulation_mode" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tier" INTEGER NOT NULL,
    "bvn_hash" TEXT,
    "nin_hash" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "WalletType" NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "anchor_ref" TEXT,
    "split_group_id" UUID,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "target_amount" DECIMAL(12,2) NOT NULL,
    "current_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "deadline" TIMESTAMP(3),
    "auto_contribute" BOOLEAN NOT NULL DEFAULT false,
    "weekly_amount" DECIMAL(12,2),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "tips" JSONB NOT NULL DEFAULT '[]',
    "warnings" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrer_id" UUID NOT NULL,
    "referee_id" UUID,
    "referee_email" TEXT,
    "credit_amount" DECIMAL(12,2) NOT NULL DEFAULT 100.00,
    "status" "ReferralStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credited_at" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_type_key" ON "wallets"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ai_insights_user_id_week_start_key" ON "ai_insights"("user_id", "week_start");

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
