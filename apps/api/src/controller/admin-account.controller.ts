import { type Request, type Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import {
  freezeDepositAccount,
  unfreezeDepositAccount,
  updateDepositAccountMetadata,
} from "../lib/baas.js";
import prisma from "../lib/prisma.js";

export const freezeAccount = async (
  req: Request<{ accountId: string }>,
  res: Response,
) => {
  try {
    const accountId = req.params.accountId as string;
    const { freezeReason, freezeDescription } = req.body;

    const user = await prisma.user.findFirst({
      where: { baasAccountId: accountId },
      select: { id: true, isFrozen: true },
    });

    if (!user) {
      return sendError(res, "Account not found", 404);
    }

    if (user.isFrozen) {
      return sendError(res, "Account is already frozen", 400);
    }

    const anchorResponse = await freezeDepositAccount(accountId, {
      freezeReason,
      freezeDescription,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isFrozen: true },
    });

    return sendSuccess(res, "Account frozen successfully", anchorResponse);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return sendError(res, error.message || "Failed to freeze account", status);
  }
};

export const unfreezeAccount = async (
  req: Request<{}, {}, { id: string; type: string }>,
  res: Response,
) => {
  try {
    const id = req.body.id as string;

    const user = await prisma.user.findFirst({
      where: { baasAccountId: id },
      select: { id: true, isFrozen: true },
    });

    if (!user) {
      return sendError(res, "Account not found", 404);
    }

    if (!user.isFrozen) {
      return sendError(res, "Account is not frozen", 400);
    }

    const anchorResponse = await unfreezeDepositAccount(id);

    await prisma.user.update({
      where: { id: user.id },
      data: { isFrozen: false },
    });

    return sendSuccess(res, "Account unfrozen successfully", anchorResponse);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return sendError(res, error.message || "Failed to unfreeze account", status);
  }
};

export const updateAccountMetadata = async (
  req: Request<{ accountId: string }>,
  res: Response,
) => {
  try {
    const accountId = req.params.accountId as string;
    const { metadata } = req.body;

    const user = await prisma.user.findFirst({
      where: { baasAccountId: accountId },
      select: { id: true },
    });

    if (!user) {
      return sendError(res, "Account not found", 404);
    }

    const anchorResponse = await updateDepositAccountMetadata(accountId, metadata);

    return sendSuccess(res, "Account metadata updated successfully", anchorResponse);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return sendError(res, error.message || "Failed to update account metadata", status);
  }
};
