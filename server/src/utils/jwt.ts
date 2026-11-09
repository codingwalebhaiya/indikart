import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./apiError.js";

interface JwtPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new ApiError(500, "JWT_ACCESS_SECRET is not defined");
  }
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new ApiError(500, "JWT_REFRESH_SECRET is not defined");
  }
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};
