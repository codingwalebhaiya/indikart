import z from "zod";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// CREATE PRODUCT VALIDATION
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters")
      .max(200, "Product name cannot be more than 200 characters"),
    description: z.string(),
    categoryIds: z.array(
      z.uuid("Invalid category ID")
    ),
    brandId: z.uuid("Invalid brand ID"),
    basePrice: z.number().positive("Price must be a positive number"),
    stock: z.number().positive("Stock must be a positive number"),
    status: productStatusSchema.default("DRAFT"),
    isFeatured: z.boolean().default(false),
  }),
});
