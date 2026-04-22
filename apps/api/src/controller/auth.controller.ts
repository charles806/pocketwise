import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await authService.signup(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain:
        process.env.NODE_ENV === "production"
          ? ".getpocketwise.vercel.app"
          : undefined,
      path: "/",
    });

    sendSuccess(
      res,
      "Account created successfully",
      {
        accessToken: result.accessToken,
        user: {
          id: result.id,
          email: result.email,
        },
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain:
        process.env.NODE_ENV === "production"
          ? ".getpocketwise.vercel.app"
          : undefined,
      path: "/",
    });

    sendSuccess(res, "Login successful", {
      accessToken: result.accessToken,
      user: result.user,
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? ".getpocketwise.vercel.app"
            : undefined,
        path: "/",
      });
    }
    sendError(res, message, status);
  }
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain:
      process.env.NODE_ENV === "production" ? ".getpocketwise.vercel.app" : undefined,
    path: "/",
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

export { signUp, login, refresh, logout, me };
