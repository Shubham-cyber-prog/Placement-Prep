import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { getMyProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);

export default router;
