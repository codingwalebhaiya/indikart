import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    req.user = payload as {
      id: string;
      sessionId: string;
      role: "USER" | "ADMIN";
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Access token is invalid or expired",
    });
  }
}

export function requireRole(...allowedRoles: Array<"USER" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission",
      });
    }

    next();
  };
}
