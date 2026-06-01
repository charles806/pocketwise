import type { Request, Response } from "express";
import { keepAliveService } from "../services/keep-alive.service.js";
import { keepAliveMonitor } from "../utils/keep-alive-monitor.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const pingController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await keepAliveService.ping();

    if (result.success) {
      keepAliveMonitor.recordSuccess(result.latencyMs);
      sendSuccess(res, "Database is reachable", {
        latencyMs: result.latencyMs,
        status: keepAliveMonitor.getStatus(),
      });
    } else {
      keepAliveMonitor.recordFailure(result.error ?? "Unknown error");
      sendError(res, "Database is unreachable", 503, {
        error: result.error,
        status: keepAliveMonitor.getStatus(),
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Keep-alive ping failed";
    keepAliveMonitor.recordFailure(message);
    sendError(res, message, 500);
  }
};

export const statusController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  sendSuccess(res, "Keep-alive health status", keepAliveMonitor.getStatus());
};
