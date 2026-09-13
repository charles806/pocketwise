import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// Driver adapters do NOT honour the schema `directUrl` at runtime, so the pool
// must itself talk to the direct (non-pooled) connection. Interactive
// transactions (FOR UPDATE locks, atomic claims) break over the Neon
// `-pooler` endpoint with P2028 ("Transaction not found"); the direct endpoint
// keeps the session alive for the whole transaction.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
