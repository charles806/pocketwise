import { Router } from "express";
import express from "express";
import { keepAliveAuthMiddleware } from "../middleware/keep-alive-auth.middleware.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware.js";
import { qstashAuthMiddleware } from "../middleware/qstash-auth.middleware.js";
import {
  dispatchWeeklySummary,
  runWeeklySummary,
} from "../features/queue/jobs/weekly-summary.js";
import {
  dispatchGoalCompletion,
  runGoalCompletion,
} from "../features/queue/jobs/goal-completion.js";
import {
  dispatchAutoContribute,
  runAutoContribute,
} from "../features/queue/jobs/auto-contribute.js";
import { sendSuccess } from "../utils/response.js";

export const jobsRouter = Router();

// Dispatchers are invoked by a QStash Schedule (previously cron-job.org) and
// stay behind the keep-alive secret like other /api/internal routes.
jobsRouter.get(
  "/weekly-summary/dispatch",
  keepAliveAuthMiddleware,
  rateLimitMiddleware,
  dispatchWeeklySummary,
);
jobsRouter.get(
  "/goal-completion/dispatch",
  keepAliveAuthMiddleware,
  rateLimitMiddleware,
  dispatchGoalCompletion,
);
jobsRouter.get(
  "/auto-contribute/dispatch",
  keepAliveAuthMiddleware,
  rateLimitMiddleware,
  dispatchAutoContribute,
);

// Runners process exactly ONE unit each and only trust QStash-signed
// requests. express.raw() preserves the raw body for signature verification.
jobsRouter.post(
  "/weekly-summary/run",
  express.raw({ type: "application/json" }),
  qstashAuthMiddleware,
  runWeeklySummary,
);
jobsRouter.post(
  "/goal-completion/run",
  express.raw({ type: "application/json" }),
  qstashAuthMiddleware,
  runGoalCompletion,
);
jobsRouter.post(
  "/auto-contribute/run",
  express.raw({ type: "application/json" }),
  qstashAuthMiddleware,
  runAutoContribute,
);

// QStash calls this when a message exhausts its retries. We log loudly so the
// failure surfaces in Sentry instead of a silent DLQ hole.
jobsRouter.post(
  "/failure",
  express.raw({ type: "application/json" }),
  qstashAuthMiddleware,
  (req, res) => {
    console.error("[QStash] Failed job:", req.body?.toString?.() ?? req.body);
    sendSuccess(res, "Failure recorded", null, 200);
  },
);
