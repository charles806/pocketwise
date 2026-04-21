import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../lib/mail.js";

interface SignupInput {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  password: string;
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

    const isSimulationMode = age < 16;
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          userName,
          email,
          phone: phoneNumber || null,
          passwordHash: passwordHash,
          dateOfBirth: dob,
          isSimulationMode,
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
      { expiresIn: "15m" },
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
      accessToken,
      refreshToken,
    };
  },

  async login(data: LoginInput) {
    const email = data.email.toLowerCase();
    const { password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
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
      { expiresIn: "15m" },
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
      },
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
        { expiresIn: "15m" },
      );

      return { accessToken };
    } catch {
      const error = new Error("Invalid or expired refresh token") as any;
      error.statusCode = 401;
      throw error;
    }
  },

  async me(userId: string) {
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
        createdAt: true,
      },
    });

    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    return user;
  },
};

export { authService };
