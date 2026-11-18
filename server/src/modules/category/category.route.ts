import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
} from "./category.controller.js";
const router = Router();

// admin routes
router.use(requireAuth);

router.post(
  "/",
  requireRole("ADMIN"),
  validate(createCategorySchema),
  createCategory,
);
router.put(
  "/",
  requireRole("ADMIN"),
  validate(updateCategorySchema),
  updateCategory,
);
router.get("/", requireRole("ADMIN", "USER"), getCategory);
router.delete("/", requireRole("ADMIN"), deleteCategory);

export default router;
