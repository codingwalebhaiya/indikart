

import { z, ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

// Accepts any Zod schema, wrapper or body-only
type AnySchema = z.ZodTypeAny;

const isWrapperSchema = (schema: AnySchema): boolean => {
  if (!(schema instanceof z.ZodObject)) return false;
  const shape = (schema as z.ZodObject<Record<string, AnySchema>>).shape;
  return "body" in shape || "query" in shape || "params" in shape;
};

export const Validate = (schema: AnySchema) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Case 1: Wrapper style -> z.object({ body: ..., query: ..., params: ... })
      if (isWrapperSchema(schema)) {
        const parsed = (await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
          headers: req.headers,
        })) as { body?: unknown; query?: unknown; params?: unknown };

        if (typeof parsed.body !== "undefined") {
          req.body = parsed.body;
        }
        if (typeof parsed.query !== "undefined") {
          (req as unknown as { query: unknown }).query = parsed.query;
        }
        if (typeof parsed.params !== "undefined") {
          (req as unknown as { params: unknown }).params = parsed.params;
        }
      } else {
        // Case 2: Body-only style -> z.object({ name, email, password })
        // This is what you are using in auth.routes.ts
        const parsed = await schema.parseAsync(req.body);
        req.body = parsed;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join("."),
          location: issue.path[0] as string | undefined,
          path: issue.path.slice(1).join("."),
          message: issue.message,
          code: issue.code,
        }));
        return next(new ApiError(400, "Validation failed", errors));
      }

      console.error("[Validate] Unexpected error:", err);
      return next(new ApiError(500, "Internal Server Error"));
    }
  };
};
