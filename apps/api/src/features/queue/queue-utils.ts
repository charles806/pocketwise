import type { PublishBatchRequest } from "@upstash/qstash";
import { qstashClient } from "./qstash.js";

const BATCH_SIZE = 100;

export function jobBaseUrl(): string {
  const base = process.env.APP_BASE_URL;
  if (!base) {
    throw new Error("APP_BASE_URL is not set in environment variables");
  }
  return base.replace(/\/+$/, "");
}

export function failureCallbackUrl(): string {
  return `${jobBaseUrl()}/api/internal/jobs/failure`;
}

/**
 * Returns the Date (UTC midnight) of the most recent Monday — used as the
 * weekly bucket for idempotent auto-contributions and weekly summaries.
 */
export function getWeekStart(from: Date = new Date()): Date {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date;
}

export function toIsoDateStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Publishes messages to QStash in chunks so large fan-outs (e.g. one message
 * per user for the weekly summary) stay within a single request budget.
 */
export async function publishBatch<TMessage extends { url: string }>(
  messages: TMessage[],
  chunkSize: number = BATCH_SIZE,
): Promise<void> {
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    await qstashClient.batchJSON(chunk as PublishBatchRequest[]);
  }
}