import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized: Missing or invalid token", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, "Unauthorized: Token missing", 401);
  }

  if (!JWT_ACCESS_SECRET) {
    return sendError(res, "Server configuration error", 500);
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded as any;
    next();
  } catch {
    return sendError(res, "Unauthorized: Invalid or expired token", 401);
  }
};
