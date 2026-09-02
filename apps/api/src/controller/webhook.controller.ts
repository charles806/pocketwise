import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { webhookService } from "../services/webhook.service.js";
import { createDepositAccount, getDepositAccount, getAccountNumber } from "../lib/baas.js";
import prisma from "../lib/prisma.js";
import { cache, CACHE_KEYS } from "../lib/cache.js";
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

// Anchor events may arrive either flat at the top level
// ({ relationships: { customer: { data: { id } } } }) or wrapped under a
// `data` key ({ data: { relationships: { customer: { data: { id } } } } }).
// Resolve the customer ID defensively across both envelopes.
const extractCustomerId = (payload: any): string | undefined =>
  payload?.relationships?.customer?.data?.id ??
  payload?.data?.relationships?.customer?.data?.id;

const extractAccountId = (payload: any): string | undefined =>
  payload?.relationships?.account?.data?.id ??
  payload?.data?.relationships?.account?.data?.id;

const extractAccountNumberId = (payload: any): string | undefined =>
  payload?.relationships?.accountNumber?.data?.id ??
  payload?.data?.relationships?.accountNumber?.data?.id;

// The deposit account an AccountNumber belongs to is exposed via its
// `settlementAccount` relationship. Resolve it defensively (flat + wrapped).
const extractSettlementAccountId = (payload: any): string | undefined =>
  payload?.relationships?.settlementAccount?.data?.id ??
  payload?.data?.relationships?.settlementAccount?.data?.id;

export const webhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-anchor-signature"] as string;
    const rawBody = req.body.toString();
    const secret = process.env.ANCHOR_WEBHOOK_SECRET!;

    console.log('[webhook-diag] body type:', typeof req.body, '| is Buffer:', Buffer.isBuffer(req.body));
    console.log('[webhook-diag] body preview:', Buffer.isBuffer(req.body) ? req.body.toString('utf8').slice(0, 100) : String(req.body).slice(0, 100));
    console.log('[webhook-diag] received signature:', req.headers['x-anchor-signature']);
    console.log('[webhook-diag] computed signature:', crypto.createHmac('sha256', secret).update(rawBody).digest('hex'));
    console.log('[webhook-diag] secret length:', process.env.ANCHOR_WEBHOOK_SECRET?.length ?? 'undefined');

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

    if (eventType === "nip.inbound.received") {
      console.log("[Webhook] nip.inbound.received received:", payload.data || payload.attributes);
      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    if (eventType === "customer.created") {
      console.log("[Webhook] customer.created received:", payload.data || payload.attributes);
      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    if (eventType === "customer.identification.approved") {
      const customerId = extractCustomerId(payload);
      console.log(`[Webhook] KYC approved for customer: ${customerId}`);

      try {
        const user = customerId
          ? await prisma.user.findFirst({ where: { baasCustomerId: customerId } })
          : null;

        if (user) {
          const accountId = await createDepositAccount(customerId!, user.id);
          console.log(
            `[Webhook] Deposit account created for user ${user.id}: ${accountId}`,
          );
        } else {
          console.warn(
            `[Webhook] KYC approved but no user found for baasCustomerId: ${customerId}`,
          );
        }
      } catch (error) {
        console.error("[Webhook] Failed to create deposit account:", error);
      }

      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    if (eventType === "account.opened") {
      const accountId = extractAccountId(payload);
      console.log(`[Webhook] Account opened: ${accountId}`);

      try {
        if (accountId) {
          const account = await getDepositAccount(accountId);
          const customerId =
            account?.relationships?.customer?.data?.id ?? undefined;

          if (customerId) {
            const user = await prisma.user.findFirst({
              where: { baasCustomerId: customerId },
            });

            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: { baasAccountId: accountId },
              });
              console.log(
                `[Webhook] Saved baasAccountId ${accountId} for user ${user.id}`,
              );
            } else {
              console.warn(
                `[Webhook] Account opened but no user found for baasCustomerId: ${customerId}`,
              );
            }
          }
        }
      } catch (error) {
        console.error("[Webhook] Failed to process account.opened:", error);
      }

      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    if (eventType === "accountNumber.created") {
      const accountNumberId = extractAccountNumberId(payload);
      const depositAccountId = extractSettlementAccountId(payload);
      console.log(
        `[Webhook] Account number created: ${accountNumberId} (deposit account: ${depositAccountId})`,
      );

      try {
        if (depositAccountId) {
          const accountNumberObj = await getAccountNumber(depositAccountId);
          const nuban = accountNumberObj?.attributes?.accountNumber;

          const user = await prisma.user.findFirst({
            where: { baasAccountId: depositAccountId },
          });

          if (user && nuban) {
            await prisma.user.update({
              where: { id: user.id },
              data: { accountNumber: nuban },
            });
            cache.del(CACHE_KEYS.userProfile(user.id));
            console.log(
              `[Webhook] Saved NUBAN ${nuban} for user ${user.id}`,
            );
          } else if (!user) {
            console.warn(
              `[Webhook] Account number created but no user found for baasAccountId: ${depositAccountId}`,
            );
          } else {
            console.warn(
              `[Webhook] Account number created but no NUBAN returned for deposit account: ${depositAccountId}`,
            );
          }
        }
      } catch (error) {
        console.error("[Webhook] Failed to process accountNumber.created:", error);
      }

      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    if (eventType === "customer.identification.error") {
      const customerId = extractCustomerId(payload);
      console.log(`[Webhook] KYC error for customer: ${customerId}`);
      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    if (eventType === "customer.identification.rejected") {
      const customerId = extractCustomerId(payload);
      console.log(`[Webhook] KYC rejected for customer: ${customerId}`);
      return sendSuccess(res, "Webhook acknowledged", null, 200);
    }

    console.log("[Webhook] Unhandled event type:", eventType);
    return sendSuccess(res, "Webhook acknowledged", null, 200);
  } catch (error) {
    console.error(error);
    sendError(res, "Internal server error", 500);
  }
};
