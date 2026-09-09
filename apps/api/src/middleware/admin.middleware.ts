import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;
  if (
    !adminSecret ||
    !authHeader ||
    !safeEqual(authHeader, `Bearer ${adminSecret}`)
  ) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  next();
};
