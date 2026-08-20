import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { webhookService } from "../services/webhook.service.js";
import crypto from "crypto";

const verifyAnchorSignature = (
  rawBody: string,
  signature: string,
  secret: string,
): boolean => {
  const candidates = ["sha256", "sha1"].flatMap((algorithm) =>
    (["hex", "base64"] as const).map((encoding) =>
      crypto
        .createHmac(algorithm, secret)
        .update(rawBody)
        .digest(encoding),
    ),
  );

  const sigBuffer = Buffer.from(signature);

  for (const candidate of candidates) {
    const candidateBuffer = Buffer.from(candidate);
    if (candidateBuffer.length !== sigBuffer.length) continue;
    if (crypto.timingSafeEqual(candidateBuffer, sigBuffer)) {
      return true;
    }
  }

  return false;
};

export const webhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-anchor-signature"] as string;
    const rawBody = req.body.toString();
    const secret = process.env.ANCHOR_WEBHOOK_SECRET!;

    console.log("[Webhook Debug] Body (first 100):", rawBody.substring(0, 100));
    console.log("[Webhook Debug] Signature header:", JSON.stringify(signature));
    console.log("[Webhook Debug] Secret length:", secret?.length);
    console.log("[Webhook Debug] Body is Buffer:", Buffer.isBuffer(req.body));
    console.log("[Webhook Debug] Computed (sha1/base64):", crypto.createHmac("sha1", secret).update(rawBody).digest("base64"));

    if (!signature || !verifyAnchorSignature(rawBody, signature, secret)) {
      return sendError(res, "Invalid signature", 401);
    }

    const payload = JSON.parse(rawBody);

    if (!payload || !payload.event || !payload.data) {
      return sendError(res, "Invalid webhook payload structure", 400);
    }

    const eventType = payload.event as string;

    if (eventType === "nip.inbound.completed") {
      const result = await webhookService.processAnchorDepositWebhook(payload);
      return sendSuccess(res, "Webhook processed successfully", result, 200);
    }

    if (eventType === "customer.created") {
      console.log("[Webhook] customer.created received:", payload.data);
      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    console.log("[Webhook] Unhandled event type:", eventType);
    return sendSuccess(res, "Webhook acknowledged", null, 200);
  } catch (error) {
    console.error(error);
    sendError(res, "Internal server error", 500);
  }
};
