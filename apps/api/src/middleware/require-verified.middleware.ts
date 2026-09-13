import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { sendError } from "../utils/response.js";
import { isVerifiedUser } from "../utils/verification.js";

export const requireVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, "Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycTier: true, baasAccountId: true },
  });

  if (!user || !isVerifiedUser(user)) {
    return sendError(
      res,
      "Please complete identity verification (KYC) before making transfers.",
      400,
    );
  }

  next();
};