import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await authService.signup(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Lax is necessary for local cross-port cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(
      res,
      "Account created successfully",
      {
        accessToken: result.accessToken,
        user: result,
      },
      201,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error creating account";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Lax is necessary for local cross-port cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, "Login successful", {
      accessToken: result.accessToken,
      user: result.user,
      requiresPinSetup: result.requiresPinSetup,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error logging in";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const result = await authService.refresh(refreshToken);
    sendSuccess(res, "Token refreshed", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error refreshing token";
    const status = (error as any)?.statusCode || 500;

    if (status === 401) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
    sendError(res, message, status);
  }
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  sendSuccess(res, "Logged out successfully");
};

const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await authService.me(userId);
    sendSuccess(res, "User profile fetched", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching profile";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const lookupUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { type, value } = req.query;

    if (!type || !value) {
      return sendError(res, "Search type and value are required", 400);
    }

    const result = await authService.lookupUser(
      type as string,
      value as string,
    );
    sendSuccess(res, "User found", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error looking up user";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { goal } = req.body;
    const result = await authService.updateGoal(userId, goal);
    sendSuccess(res, "Goal updated successfuly", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error updating goal";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const setupPin = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { pin } = req.body;
    const result = await authService.setupPin(userId, pin);
    sendSuccess(res, result.message, result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error setting up PIN";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const changePin = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { currentPin, newPin } = req.body;
    const result = await authService.changePin(userId, currentPin, newPin);
    sendSuccess(res, result.message, result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error changing PIN";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result.message, { success: result.success });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error processing request";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    sendSuccess(res, "OTP verified successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error verifying OTP";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, password } = req.body;
    const result = await authService.resetPassword(email, token, password);
    sendSuccess(res, result.message, { success: result.success });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error resetting password";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

export {
  signUp,
  login,
  refresh,
  logout,
  me,
  lookupUser,
  updateGoal,
  setupPin,
  changePin,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
