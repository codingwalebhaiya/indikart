import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../infrastructure/logger/logger.js";
import { ApiError } from "../utils/apiError.js";

export const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
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

  // 5. Agar simple Error hai (Repository se aaya hai)
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};


//  ------------------- note -------------

// Frontend: { name: "" } bheja (galat data)
//    ↓
// Route: validate(createCategorySchema) - Zod check karega
//    ↓
// Zod bolega: "name min 2 characters chahiye" - ZodError phenkega
//    ↓
// validate middleware: next(err) karega
//    ↓
// error.middleware: ZodError ko pakad ke 400 bana ke Frontend ko bhej dega
//    ↓
// Frontend: "Name should be at least 2 characters" dikhega