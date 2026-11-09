import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../infrastructure/logger/logger.js";
import { ApiError } from "../utils/apiError.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Delegate if the response has already started.
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handle custom application errors.
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // 2. Handle Zod validation errors.
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // 3. Handle PostgreSQL unique constraint violations.
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "23505"
  ) {
    return res.status(409).json({
      success: false,
      message: "A record with this information already exists",
    });
  }

  // 4. Log unexpected errors.
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
      
    },
    "Unhandled application error",
  );

  // 5. Return a safe response.
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
