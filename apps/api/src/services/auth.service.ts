import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../lib/mail.js";
import { generateMockAccountNumber } from "../utils/account.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";

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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error("Email already in use") as any;
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
          { userId: user.id, type: "savings", isLocked: true },
          { userId: user.id, type: "emergency", isLocked: true },
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
      ) as any;

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        const error = new Error("Invalid token") as any;
        error.statusCode = 401;
        throw error;
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: "45m" },
      );

      return { accessToken };
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
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
};

export { authService };
