-- CreateTable
CREATE TABLE "bank_recipients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "bank_code" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "last_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_recipients_user_id_idx" ON "bank_recipients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_recipients_user_id_account_number_key" ON "bank_recipients"("user_id", "account_number");

-- AddForeignKey
ALTER TABLE "bank_recipients" ADD CONSTRAINT "bank_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
