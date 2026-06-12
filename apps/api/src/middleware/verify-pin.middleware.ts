import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { sendError } from "../utils/response.js";

export const verifyTransferPin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { pin } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, "Unauthorized", 401);
  }

  if (!pin) {
    return sendError(res, "Transfer PIN is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transferPin: true },
  });

  if (!user?.transferPin) {
    return sendError(
      res,
      "PIN not set up. Please set your transfer PIN first.",
      403,
    );
  }

  const isValid = await bcrypt.compare(pin.toString(), user.transferPin);
  if (!isValid) {
    return sendError(res, "Invalid PIN", 401);
  }

  next();
};
