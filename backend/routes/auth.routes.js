import express from "express";
import { register, login, me, firebaseAuth } from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";
import { validate, registerSchema, loginSchema, firebaseAuthSchema } from "../utils/validators.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/firebase", validate(firebaseAuthSchema), firebaseAuth);
router.get("/me", protect, me);

export default router;
