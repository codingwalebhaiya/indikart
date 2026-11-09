import { Router } from "express";
import { authController } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
