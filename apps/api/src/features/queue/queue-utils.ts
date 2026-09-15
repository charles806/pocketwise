import type { PublishBatchRequest } from "@upstash/qstash";
import type { Response } from "express";
import { qstashClient } from "./qstash.js";
import { sendError } from "../../utils/response.js";

const BATCH_SIZE = 100;

/**
 * Raised when QStash rejects publishing because the daily message quota is
 * exhausted. Dispatchers map this to a 503 so the cause is visible instead of
 * a generic 500.
 */
export class QStashRateLimitError extends Error {
  readonly resetEpochSeconds: number;

  constructor(resetEpochSeconds: number) {
    super(
      `QStash daily rate limit reached (resets ${new Date(
        resetEpochSeconds * 1000,
      ).toISOString()})`,
    );
    this.name = "QStashRateLimitError";
    this.resetEpochSeconds = resetEpochSeconds;
  }
}

const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof QStashRateLimitError) return true;
  const name = (error as { name?: string })?.name ?? "";
  const status = (error as { status?: number | string })?.status;
  return (
    name.includes("RateLimit") ||
    name.includes("Ratelimit") ||
    status === 429
  );
};

const toRateLimitError = (error: unknown): QStashRateLimitError => {
  const reset = Number(
    (error as { reset?: unknown })?.reset ?? Date.now() / 1000 + 60,
  );
  return new QStashRateLimitError(Number.isFinite(reset) ? reset : 0);
};

/**
 * Shared dispatcher error handler: surfaces a 503 when QStash hit its daily
 * message cap (with the reset time), otherwise a 500 with the underlying
 * message so failures are diagnosable from the response alone.
 */
export function handleDispatchError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
): void {
  if (isRateLimitError(error)) {
    const rateLimitError = toRateLimitError(error);
    sendError(res, rateLimitError.message, 503, error);
    return;
  }
  const detail = error instanceof Error ? `: ${error.message}` : "";
  sendError(res, `${fallbackMessage}${detail}`, 500, error);
}

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
    if (chunk.length === 0) continue;
    try {
      await qstashClient.batchJSON(chunk as PublishBatchRequest[]);
    } catch (error) {
      // Translate QStash quota exhaustion into a recognizable type so
      // dispatchers can return 503 + the reset time instead of a masked 500.
      if (isRateLimitError(error)) {
        throw toRateLimitError(error);
      }
      throw error;
    }
  }
}