import type { Request, Response } from "express";
import { sweepStalePendingTransfers } from "../../../services/transfer-settlement.service.js";
import { sendError, sendSuccess } from "../../../utils/response.js";
import {
  failureCallbackUrl,
  jobBaseUrl,
  publishBatch,
} from "../../queue/queue-utils.js";

const RUN_PATH = "/api/internal/jobs/transfer-reconciliation/run";

/**
 * Dispatcher — called on a schedule (~every 5 min). Enqueues one "reconcile
 * stale pending transfers" message, deduplicated to a 5-minute window so
 * re-dispatching is harmless.
 */
export async function dispatchSweep(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const bucket = Math.floor(Date.now() / 300_000);
    const deduplicationId = `transfer-reconciliation:${bucket}`;

    await publishBatch([
      {
        url: `${jobBaseUrl()}${RUN_PATH}`,
        body: {},
        deduplicationId,
        retries: 2,
        callback: failureCallbackUrl(),
      },
    ]);

    sendSuccess(res, "Transfer reconciliation dispatched", {
      bucket,
    });
  } catch (error) {
    sendError(res, "Failed to dispatch transfer reconciliation", 500, error);
  }
}

/**
 * Handler — sweeps stale pending outbound transfers (NIP + book). Idempotent:
 * settleOutboundTransfer claims each debit row inside a FOR UPDATE transaction,
 * so overlapping dispatches / webhook processing can never double-settle.
 */
export async function runSweep(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await sweepStalePendingTransfers({ limit: 10 });

    sendSuccess(res, "Transfer reconciliation complete", result, 200);
  } catch (error) {
    sendError(res, "Failed to run transfer reconciliation", 500, error);
  }
}