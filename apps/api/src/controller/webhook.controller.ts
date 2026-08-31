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

  // Anchor sends base64(hex(HMAC_SHA1(body, key))) — double-encoded
  for (const algorithm of ["sha256", "sha1"]) {
    const hexDigest = crypto
      .createHmac(algorithm, secret)
      .update(rawBody)
      .digest("hex");
    candidates.push(Buffer.from(hexDigest).toString("base64"));
  }

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

    if (!signature || !verifyAnchorSignature(rawBody, signature, secret)) {
      return sendError(res, "Invalid signature", 401);
    }

    const payload = JSON.parse(rawBody);

    if (!payload) {
      return sendError(res, "Invalid webhook payload structure", 400);
    }

    const eventType = (payload.event || payload.type) as string;

    if (!eventType) {
      return sendError(res, "Missing event type in payload", 400);
    }

    if (eventType === "nip.inbound.completed") {
      const result = await webhookService.processAnchorDepositWebhook(payload);
      return sendSuccess(res, "Webhook processed successfully", result, 200);
    }

    if (eventType === "customer.created") {
      console.log("[Webhook] customer.created received:", payload.data || payload.attributes);
      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    console.log("[Webhook] Unhandled event type:", eventType);
    return sendSuccess(res, "Webhook acknowledged", null, 200);
  } catch (error) {
    console.error(error);
    sendError(res, "Internal server error", 500);
  }
};
