// src/middlewares/validate.middleware.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";
import { ZodError } from "zod";
import { logger } from "../infrastructure/logger/logger.js";
import { ApiError } from "../utils/apiError.js";

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
        // return res.status(400).json({
        //   success: false,
        //   message: "Validation failed",
        //   errors: error.issues.map((err) => ({
        //     field: err.path.join("."),
        //     message: err.message,
        //   })),
        // });

        // Zod ke saare errors ko ek message me jodo
        const message = error.issues.map((err) => err.message).join(", ");

        // Yaha ZodError ko ApiError me convert kar diya - 400 Bad Request

        return next(new ApiError(400, message));
      }

      logger.error(`Validation middleware error: ${error}`);
      next(error);
    }
  };
