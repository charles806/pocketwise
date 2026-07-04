import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendOtpEmail } from "../lib/mail.js";
import crypto from "crypto";
import { generateMockAccountNumber } from "../utils/account.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";
import { redis } from "../lib/redis.js";

interface SignupInput {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  password: string;
  primaryGoal?: string;
  accountNumber: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const authService = {
  async signup(data: SignupInput) {
    const {
      firstName,
      lastName,
      userName,
      email: rawEmail,
      phoneNumber,
      dateOfBirth,
      password,
      primaryGoal,
      accountNumber,
    } = data;

    const email = rawEmail.toLowerCase();

    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) {
      const error = new Error("Email already in use") as any;
      error.statusCode = 409;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        userName
      },
      select: { id: true }
    })

    if (existingUser) {
      const error = new Error("Username already exists") as any;
      error.statusCode = 409;
      throw error;
    }
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 16) {
      const error = new Error(
        "You must be at least 16 years old to create an account",
      ) as any;
      error.statusCode = 400;
      throw error;
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          userName,
          email,
          accountNumber: generateMockAccountNumber(),
          phone: phoneNumber || null,
          passwordHash: passwordHash,
          dateOfBirth: dob,
          primaryGoal: primaryGoal || null,
          onboardingComplete: !!primaryGoal,
        },
      });

      await tx.wallet.createMany({
        data: [
          { userId: user.id, type: "spend" },
          { userId: user.id, type: "savings" },
          { userId: user.id, type: "emergency" },
          { userId: user.id, type: "flex" },
        ],
      });

      return user;
    });

    sendWelcomeEmail(newUser.email, newUser.firstName).catch(console.error);

    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "45m" },
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      userName: newUser.userName,
      isSimulationMode: newUser.isSimulationMode,
      onboardingComplete: newUser.onboardingComplete,
      primaryGoal: newUser.primaryGoal,
      accessToken,
      refreshToken,
    };
  },

  async login(data: LoginInput) {
    const email = data.email.toLowerCase();
    const { password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        passwordHash: true,
        isSimulationMode: true,
        onboardingComplete: true,
        primaryGoal: true,
        transferPin: true,
      },
    });
    if (!user) {
      const error = new Error("Invalid credentials") as any;
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials") as any;
      error.statusCode = 401;
      throw error;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "45m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        isSimulationMode: user.isSimulationMode,
        onboardingComplete: user.onboardingComplete,
        primaryGoal: user.primaryGoal,
      },
      requiresPinSetup: !user.transferPin,
    };
  },

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
        { algorithms: ["HS256"] },
      ) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true },
      });
      if (!user) {
        const error = new Error("Invalid token") as any;
        error.statusCode = 401;
        throw error;
      }

      const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw Object.assign(new Error("Token has been invalidated"), {
          statusCode: 401,
        });
      }

      // Rotate: blacklist old refresh token and issue a new one
      await redis.setex(`blacklist:${refreshToken}`, 7 * 24 * 60 * 60, "1");

      const newRefreshToken = jwt.sign(
        { id: user.id, email: decoded.email },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" },
      );

      const accessToken = jwt.sign(
        { id: user.id, email: decoded.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: "45m" },
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      const error = new Error("Invalid or expired refresh token") as any;
      error.statusCode = 401;
      throw error;
    }
  },

  async me(userId: string) {
    const cacheKey = CACHE_KEYS.userProfile(userId);
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phone: true,
        kycTier: true,
        isSimulationMode: true,
        onboardingComplete: true,
        primaryGoal: true,
        createdAt: true,
        profilePicture: true,
        transferPin: true,
      },
    });

    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    const result = {
      ...user,
      requiresPinSetup: !user.transferPin,
      transferPin: undefined,
    };

    await cache.set(cacheKey, result, TTL.USER_PROFILE);
    return result;
  },

  async lookupUser(type: string, value: string) {
    const cacheKey = CACHE_KEYS.userLookup(type, value);
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    let user;
    switch (type) {
      case "account":
        user = await prisma.user.findUnique({
          where: { accountNumber: value },
          select: { id: true, firstName: true, lastName: true, userName: true },
        });
        break;
      case "phone":
        user = await prisma.user.findUnique({
          where: { phone: value },
          select: { id: true, firstName: true, lastName: true, userName: true },
        });
        break;
      case "username":
        user = await prisma.user.findFirst({
          where: { userName: { equals: value, mode: "insensitive" } },
          select: { id: true, firstName: true, lastName: true, userName: true },
        });
        break;
      default: {
        const error = new Error("Invalid search type") as any;
        error.statusCode = 400;
        throw error;
      }
    }

    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    await cache.set(cacheKey, user, TTL.LOOKUP);
    return user;
  },

  async updateGoal(userId: string, goal: string | null) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        primaryGoal: goal,
        onboardingComplete: true,
      },
      select: {
        id: true,
        onboardingComplete: true,
        primaryGoal: true,
      },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));
    return user;
  },

  async setupPin(userId: string, pin: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { transferPin: true },
    });
    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    if (user.transferPin) {
      const error = new Error("PIN already set up") as any;
      error.statusCode = 400;
      throw error;
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { transferPin: hashedPin },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));
    return { success: true, message: "PIN set successfully" };
  },

  async changePin(userId: string, currentPin: string, newPin: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { transferPin: true },
    });
    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    if (!user.transferPin) {
      const error = new Error("PIN not set up") as any;
      error.statusCode = 403;
      throw error;
    }

    const isValid = await bcrypt.compare(currentPin, user.transferPin);
    if (!isValid) {
      const error = new Error("Current PIN is incorrect") as any;
      error.statusCode = 401;
      throw error;
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { transferPin: hashedPin },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));
    return { success: true, message: "PIN changed successfully" };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
      };
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    await cache.set(CACHE_KEYS.otpReset(user.email), otp, TTL.OTP);

    sendOtpEmail(user.email, otp, user.firstName).catch(console.error);

    return {
      success: true,
      message: "If an account with that email exists, an OTP has been sent.",
    };
  },

  async verifyOtp(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase();
    const storedOtp = await cache.get<string>(
      CACHE_KEYS.otpReset(normalizedEmail),
    );

    if (!storedOtp || storedOtp !== otp) {
      const error = new Error("Invalid or expired OTP") as any;
      error.statusCode = 400;
      throw error;
    }

    await cache.del(CACHE_KEYS.otpReset(normalizedEmail));

    const resetToken = crypto.randomBytes(32).toString("hex");
    await cache.set(
      CACHE_KEYS.resetToken(normalizedEmail),
      resetToken,
      TTL.RESET_TOKEN,
    );

    return { success: true, token: resetToken };
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    const normalizedEmail = email.toLowerCase();
    const storedToken = await cache.get<string>(
      CACHE_KEYS.resetToken(normalizedEmail),
    );

    if (!storedToken || storedToken !== token) {
      const error = new Error("Invalid or expired reset token") as any;
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    await cache.del(CACHE_KEYS.resetToken(normalizedEmail));

    return { success: true, message: "Password reset successfully" };
  },

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      userName?: string;
    },
  ) {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { userName: true, phone: true, accountNumber: true },
    });

    if (data.userName) {
      const existing = await prisma.user.findFirst({
        where: { userName: data.userName, id: { not: userId } },
      });
      if (existing) {
        const error = new Error("Username is already taken") as any;
        error.statusCode = 409;
        throw error;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.userName !== undefined && { userName: data.userName }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phone: true,
        kycTier: true,
        isSimulationMode: true,
        onboardingComplete: true,
        primaryGoal: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));

    if (oldUser?.userName) {
      await cache
        .del(CACHE_KEYS.userLookup("username", oldUser.userName))
        .catch(() => { });
    }
    if (oldUser?.phone) {
      await cache
        .del(CACHE_KEYS.userLookup("phone", oldUser.phone))
        .catch(() => { });
    }
    if (oldUser?.accountNumber) {
      await cache
        .del(CACHE_KEYS.userLookup("account", oldUser.accountNumber))
        .catch(() => { });
    }

    return { ...updated, requiresPinSetup: false };
  },

  async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    const isValid = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      const error = new Error("Current password is incorrect") as any;
      error.statusCode = 401;
      throw error;
    }

    if (data.currentPassword === data.newPassword) {
      const error = new Error(
        "New password must be different from current password",
      ) as any;
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));
    return { success: true, message: "Password changed successfully" };
  },

  async uploadAvatar(userId: string, image: string) {
    const { cloudinary } = await import("../lib/cloudinary.js");

    const result = await cloudinary.uploader.upload(image, {
      folder: "pocketwise/avatars",
    });

    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: result.secure_url },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));
    return { profilePicture: result.secure_url };
  },
};

export { authService };
