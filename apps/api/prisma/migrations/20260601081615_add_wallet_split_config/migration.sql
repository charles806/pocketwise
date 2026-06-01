-- CreateTable
CREATE TABLE "wallet_split_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "spend_percent" DECIMAL(5,2) NOT NULL,
    "savings_percent" DECIMAL(5,2) NOT NULL,
    "emergency_percent" DECIMAL(5,2) NOT NULL,
    "flex_percent" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_split_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_split_configs_user_id_key" ON "wallet_split_configs"("user_id");

-- AddForeignKey
ALTER TABLE "wallet_split_configs" ADD CONSTRAINT "wallet_split_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
