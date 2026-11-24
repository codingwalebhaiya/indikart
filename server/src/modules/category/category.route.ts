import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  getAllCategoriesSchema,
  getCategoryBySlugSchema,
  updateCategorySchema,
} from "./category.validation.js";
import { CategoryController } from "./category.controller.js";
import { CategoryService } from "./category.service.js";
import { CategoryRepository } from "./category.repository.js";

const router = Router();
const repository = new CategoryRepository();
const service = new CategoryService(repository);
const controller = new CategoryController(service);

// admin routes
router.use(requireAuth);

router.post(
  "/",
  requireRole("ADMIN"),
  validate(createCategorySchema),
  controller.create,
);
router.put(
  "/:id",
  requireRole("ADMIN"),
  validate(updateCategorySchema),
  controller.update,
);
router.get("/", validate(getAllCategoriesSchema), controller.getAll);
router.delete(
  "/:id",
  validate(deleteCategorySchema),
  requireRole("ADMIN"),
  controller.delete,
);

// get category by slug for public
router.get("/:slug", validate(getCategoryBySlugSchema), controller.getBySlug);

export default router;
