import { z } from "zod";

// Reusable - DRY
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email format")
  .max(255, "Email too long");

const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Must contain at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least 1 special character");

// Body only - use this if your Validate supports body-only
export const registerBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),

    email: emailSchema,

    password: passwordSchema,
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: emailSchema,
    password: z.string().trim().min(1, "Password is required"),
  })
  .strict();

// Wrapper for our Validate middleware that expects { body, query, params }
export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginSchema = z.object({
  body: loginBodySchema,
});

// Types for controller/service - no need to write interfaces again
export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
