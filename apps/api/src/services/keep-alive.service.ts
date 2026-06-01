import prisma from "../lib/prisma.js";
import type { KeepAliveResult } from "../types/keep-alive.types.js";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const keepAliveService = {
  async ping(attempt = 1): Promise<KeepAliveResult> {
    const start = Date.now();

    try {
      const rawResult = await prisma.$queryRawUnsafe<unknown[]>("SELECT 1");
      const latencyMs = Date.now() - start;

      if (!Array.isArray(rawResult) || rawResult.length === 0) {
        throw new Error("Unexpected query result");
      }

      return { success: true, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - start;
      const message =
        error instanceof Error ? error.message : "Unknown database error";

      if (attempt < MAX_RETRIES) {
        const backoffMs = BASE_DELAY_MS * 2 ** (attempt - 1);
        console.warn(
          `[KeepAlive] Retry ${attempt}/${MAX_RETRIES} after ${backoffMs}ms | Error: ${message}`,
        );
        await delay(backoffMs);
        return this.ping(attempt + 1);
      }

      return { success: false, latencyMs, error: message };
    }
  },
};
