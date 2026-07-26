ALTER TABLE "users" RENAME COLUMN "anchor_account_id" TO "baas_account_id";
ALTER TABLE "users" RENAME COLUMN "anchor_customer_id" TO "baas_customer_id";
ALTER TABLE "transactions" RENAME COLUMN "anchor_ref" TO "baas_ref";
