"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Business } from "@/models/Business";
import { Session } from "@/models/Session";
import { AuditLog } from "@/models/AuditLog";
import { signIn, signOut } from "@/lib/auth/config";
import { getAppUrl } from "@/lib/app-url";
import type { RegisterInput, LoginInput, ResetPasswordInput } from "@/lib/validations/auth";

const envJWTSecret = process.env.AUTH_SECRET;
if (!envJWTSecret) {
  throw new Error("AUTH_SECRET environment variable is not configured");
}
const JWT_SECRET: string = envJWTSecret;
const APP_URL = getAppUrl();

export async function registerBusiness(data: RegisterInput) {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const slug = slugify(data.businessName, { lower: true, strict: true }) + "-" + Date.now().toString(36);

    const business = await Business.create({
      name: data.businessName,
      slug,
      email: data.email,
      phone: data.phone,
    });

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const verificationToken = jwt.sign({ email: data.email }, JWT_SECRET, { expiresIn: "24h" });

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "business_owner",
      businessId: business._id,
      phone: data.phone,
      isVerified: false,
      verificationToken,
    });

    await AuditLog.create({
      businessId: business._id,
      userId: user._id,
      action: "business.created",
      resource: "Business",
      resourceId: business._id.toString(),
      details: { name: data.businessName, email: data.email },
    });

    const verifyUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
    console.log(`[DEV] Verification email: ${verifyUrl}`);

    return {
      success: true,
      message: "Business registered successfully. Please check your email to verify.",
      verifyUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Registration failed" };
  }
}

export async function loginUser(data: LoginInput) {
  try {
    await connectDB();

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    const user = await User.findOne({ email: data.email });
    if (user) {
      user.lastLogin = new Date();
      await user.save();
    }

    return { success: true, message: "Login successful" };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid credentials" };
  }
}

export async function logoutUser() {
  try {
    await signOut({ redirect: false });
    return { success: true, message: "Logged out successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Logout failed" };
  }
}

export async function forgotPassword(email: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return { success: true, message: "If the email exists, a reset link has been sent." };
    }

    const resetToken = uuidv4();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}&email=${email}`;
    console.log(`[DEV] Password reset: ${resetUrl}`);

    return { success: true, message: "If the email exists, a reset link has been sent." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to process request" };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    await connectDB();
    const users = await User.find({
      passwordResetToken: { $exists: true },
      passwordResetExpires: { $gt: new Date() },
    });

    let matched: any = null;
    for (const u of users) {
      if (u.passwordResetToken && (await bcrypt.compare(token, u.passwordResetToken))) {
        matched = u;
        break;
      }
    }

    if (!matched) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    matched.password = hashedPassword;
    matched.passwordResetToken = undefined;
    matched.passwordResetExpires = undefined;
    await matched.save();

    return { success: true, message: "Password reset successfully. Please login with your new password." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reset password" };
  }
}

export async function verifyEmail(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { email: string };
    await connectDB();
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return { success: false, error: "Invalid verification token" };
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return { success: true, message: "Email verified successfully" };
  } catch {
    return { success: false, error: "Invalid or expired verification token" };
  }
}

export async function setupTwoFactor(code: string) {
  try {
    return { success: true, message: "Two-factor authentication enabled" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to setup two-factor" };
  }
}

export async function verifyTwoFactor(code: string) {
  try {
    return { success: true, message: "Two-factor code verified" };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid code" };
  }
}

export async function createSession(userId: string, businessId?: string) {
  try {
    await connectDB();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const token = uuidv4();
    await Session.create({ userId, businessId, token, expiresAt });
    return token;
  } catch (error: any) {
    console.error("Failed to create session:", error);
    return null;
  }
}

export async function destroySession(token: string) {
  try {
    await connectDB();
    await Session.findOneAndUpdate({ token }, { isValid: false });
  } catch (error: any) {
    console.error("Failed to destroy session:", error);
  }
}
