import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { logger } from "../../infrastructure/logger/logger.js";

const register = async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: { id: user.id, name: user.name, email: user.email },
    }),
  );
};

const login = async (req: Request, res: Response) => {
  const loginMetadata = {
    ipAddress: req.ip || req.socket.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
  };

  const { user, accessToken, refreshToken } = await authService.loginUser(
    req.body,
    loginMetadata,
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info(`User logged in successfully ${user.email}`);

  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user: { id: user.id, name: user.name, email: user.email },
    }),
  );
};

export const authController = {
  register,
  login,
};
