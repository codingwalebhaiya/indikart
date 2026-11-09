// src/middlewares/validate.middleware.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";
import { ZodError } from "zod";
import { logger } from "../infrastructure/logger/logger.js";

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      logger.error(`Validation middleware error: ${error}`);
      next(error);
    }
  };
