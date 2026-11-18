import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    parentId: z.string().uuid().nullable().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(), // yaha id URL se aa rahi hai, isko validate karna hai
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    parentId: z.string().uuid().nullable().optional(),
  }),
});

// DELETE - DELETE /api/categories/:id
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
});

// GET ONE / GET BY ID - GET /api/categories/:id
export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
});

// GET ALL - GET /api/categories
export const getAllCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    parentId: z.string().uuid().optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];

export type DeleteCategoryInput = z.infer<
  typeof deleteCategorySchema
>["params"];

export type GetCategoryByIdInput = z.infer<
  typeof getCategoryByIdSchema
>["params"];

export type GetAllCategoriesInput = z.infer<
  typeof getAllCategoriesSchema
>["query"];
