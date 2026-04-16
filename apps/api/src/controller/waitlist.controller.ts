import type { Request, Response } from "express";
import { waitListService } from "../services/waitlist.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const joinWaitList = async (req: Request, res: Response) => {
  try {
    const result = await waitListService.joinWaitList(req.body);
    sendSuccess(res, "Joined Waitlist Successfully", result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error Joining waitlist";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

export const getWaitlistCount = async (req: Request, res: Response) => {
  try {
    const result = await waitListService.getCount();
    sendSuccess(res, "Waitlist count", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error getting count";
    sendError(res, message, 500);
  }
};

export const getAllWaitlist = async (req: Request, res: Response) => {
  try {
    const result = await waitListService.getAll();
    sendSuccess(res, "Waitlist entries", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error getting waitlist";
    sendError(res, message, 500);
  }
};
