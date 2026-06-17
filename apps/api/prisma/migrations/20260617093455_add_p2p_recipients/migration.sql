-- CreateTable
CREATE TABLE "p2p_recipients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "recipient_first_name" TEXT NOT NULL,
    "recipient_last_name" TEXT NOT NULL,
    "recipient_username" TEXT NOT NULL,
    "last_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "p2p_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "p2p_recipients_user_id_idx" ON "p2p_recipients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "p2p_recipients_user_id_recipient_user_id_key" ON "p2p_recipients"("user_id", "recipient_user_id");

-- AddForeignKey
ALTER TABLE "p2p_recipients" ADD CONSTRAINT "p2p_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
