import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
