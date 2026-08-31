-- CreateTable
CREATE TABLE "auto_contributions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goal_id" UUID NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auto_contributions_goal_id_week_start_key" ON "auto_contributions"("goal_id", "week_start");

-- CreateIndex
CREATE INDEX "auto_contributions_goal_id_idx" ON "auto_contributions"("goal_id");

-- AddForeignKey
ALTER TABLE "auto_contributions" ADD CONSTRAINT "auto_contributions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
