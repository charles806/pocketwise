import type { Request, Response } from "express";
import z from "zod";
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
} from "../validators/savings-goal.validator.js";
import { savingsGoalService } from "../services/saving-goal.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

const uuidParamSchema = z.string().uuid("Invalid goal ID format");

export const createSavingsGoalController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const parse = createSavingsGoalSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).json({
        success: false,
        errors: parse.error.flatten().fieldErrors,
      });
    }

    const validatedData = parse.data;

    const result = await savingsGoalService.createSavingsGoal(
      userId,
      validatedData,
    );

    return sendSuccess(res, "Success", result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error Creating Savings Goal";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};

export const getSavingsGoalController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await savingsGoalService.getSavingsGoals(userId);

    return sendSuccess(res, "Savings goals fetched successfully", result);
  } catch (error) {
    return sendError(res, "Failed to fetch savings goals", 500, error);
  }
};

export const updateSavingsGoalController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const goalIdResult = uuidParamSchema.safeParse(goalId);

    if (!goalIdResult.success) {
      return sendError(
        res,
        "Invalid goal ID format",
        400,
        goalIdResult.error.flatten(),
      );
    }

    const parse = updateSavingsGoalSchema.safeParse(req.body);

    if (!parse.success) {
      return sendError(
        res,
        "Validation failed",
        400,
        parse.error.flatten().fieldErrors,
      );
    }

    const result = await savingsGoalService.updateSavingsGoal(
      userId,
      goalIdResult.data,
      parse.data,
    );

    return sendSuccess(res, "Savings goal updated successfully", result);
  } catch (error) {
    return sendError(
      res,
      error instanceof Error ? error.message : "Failed to update savings goal",
      500,
      error,
    );
  }
};

export const deleteSavingsGoalController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { goalId } = req.params;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const goalIdResult = uuidParamSchema.safeParse(goalId);

    if (!goalIdResult.success) {
      return sendError(
        res,
        "Invalid goal ID format",
        400,
        goalIdResult.error.flatten(),
      );
    }

    const result = await savingsGoalService.deleteSavingsGoal(
      userId,
      goalIdResult.data,
    );

    return sendSuccess(res, "Success", result, 200);
  } catch (error) {
    return sendError(
      res,
      error instanceof Error ? error.message : "Failed to delete savings goal",
      500,
      error,
    );
  }
};
