import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { db } from "../../db/db.js";
import { users, sessions } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiError } from "../../utils/apiError.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

interface LoginMetadata {
  ipAddress?: string;
  userAgent?: string;
}

const registerUser = async (userData: RegisterInput) => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, userData.email.toLowerCase()))
    .limit(1);

  if (existingUser.length > 0) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  if (!user) {
    throw new ApiError(404, "Failed to create user");
  }

  return user;
};

const loginUser = async (userData: LoginInput, metadata: LoginMetadata) => {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, userData.email.toLowerCase()))
    .limit(1);

  if (!existingUser) {
    throw new ApiError(401, "Invalid email or password");
  }
  const isPasswordValid = await bcrypt.compare(
    userData.password,
    existingUser.password,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const payload = {
    id: existingUser.id,
    role: existingUser.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + 7);

  // don't store raw JWT in DB - hash it
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await db
    .insert(sessions)
    .values({
      userId: existingUser.id,
      refreshTokenHash,
      expiresAt: sessionExpiry,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    })
    .returning();

  return {
    accessToken,
    refreshToken,
    user: existingUser,
  };
};
export default { registerUser, loginUser };
