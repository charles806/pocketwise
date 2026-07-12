import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { redis } from "../lib/redis.js";
import { z } from "zod/v4";

const lookupQuerySchema = z.object({
  type: z.enum(["account", "phone", "username"]),
  value: z.string().min(1).max(100),
});

const updateGoalSchema = z.object({
  goal: z.string().min(1).max(100),
});

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await authService.signup(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken, ...safeUser } = result;
    sendSuccess(
      res,
      "Account created successfully",
      {
        user: safeUser,
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
      sameSite: "lax",
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

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    sendSuccess(res, "Token refreshed", { accessToken: result.accessToken });
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

const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  const token = req.cookies.refreshToken;

  if (token) {
    await redis.setex(`blacklist:${token}`, 7 * 24 * 60 * 60, "1");
  }

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

    const parsed = lookupQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(res, "Invalid search parameters", 400);
    }

    const { type, value } = parsed.data;
    const result = await authService.lookupUser(type, value);
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

    const parsed = updateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(
        res,
        "Goal must be a string between 1 and 100 characters",
        400,
      );
    }

    const { goal } = parsed.data;
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
    const { identifier } = req.body;
    const result = await authService.forgotPassword(identifier);
    sendSuccess(res, result.message, {
      success: result.success,
      channel: result.channel,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error processing request";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body;
    const result = await authService.verifyOtp(identifier, otp);
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
    const { identifier, token, newPassword, confirmPassword } = req.body;
    const result = await authService.resetPassword(
      identifier,
      token,
      newPassword,
      confirmPassword,
    );
    sendSuccess(res, result.message, { success: result.success });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error resetting password";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const forgotPin = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const result = await authService.forgotPin(phone);
    sendSuccess(res, result.message, {
      success: result.success,
      channel: result.channel,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error processing request";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const verifyPinOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyPinOtp(phone, otp);
    sendSuccess(res, "OTP verified successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error verifying OTP";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const resetPin = async (req: Request, res: Response) => {
  try {
    const { phone, token, newPin, confirmPin } = req.body;
    const result = await authService.resetPin(phone, token, newPin, confirmPin);
    sendSuccess(res, result.message, { success: result.success });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error resetting PIN";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const result = await authService.updateProfile(userId, req.body);
    sendSuccess(res, "Profile updated successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error updating profile";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const result = await authService.changePassword(userId, req.body);
    sendSuccess(res, "Password updated successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error changing password";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};

const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const { image } = req.body;
    if (!image || typeof image !== "string") {
      return sendError(res, "Image is required and must be a string", 400);
    }
    if (!image.startsWith("data:image/")) {
      return sendError(
        res,
        "Invalid image format. Must be a base64 encoded image",
        400,
      );
    }
    if (
      !image.startsWith("data:image/jpeg;base64,") &&
      !image.startsWith("data:image/png;base64,") &&
      !image.startsWith("data:image/webp;base64,")
    ) {
      return sendError(res, "Only JPEG, PNG, and WebP images are allowed", 400);
    }
    let decodedBuffer: Buffer;
    try {
      decodedBuffer = Buffer.from(image.split(",")[1] ?? "", "base64");
    } catch {
      return sendError(res, "Invalid base64 encoding", 400);
    }

    if (decodedBuffer.length > 2_000_000) {
      return sendError(res, "Image too large. Maximum size is 2MB", 400);
    }

    const magicBytes = decodedBuffer.subarray(0, 4);
    const isValidImage =
      (magicBytes[0] === 0xff &&
        magicBytes[1] === 0xd8 &&
        magicBytes[2] === 0xff) ||
      (magicBytes[0] === 0x89 &&
        magicBytes[1] === 0x50 &&
        magicBytes[2] === 0x4e &&
        magicBytes[3] === 0x47) ||
      (magicBytes[0] === 0x52 &&
        magicBytes[1] === 0x49 &&
        magicBytes[2] === 0x46 &&
        magicBytes[3] === 0x46);

    if (!isValidImage) {
      return sendError(res, "Invalid image content", 400);
    }

    const result = await authService.uploadAvatar(userId, image);
    sendSuccess(res, "Avatar uploaded successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error uploading avatar";
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
  forgotPin,
  verifyPinOtp,
  resetPin,
  updateProfile,
  changePassword,
  uploadAvatar,
};
