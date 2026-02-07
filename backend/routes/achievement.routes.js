import express from "express";
import { getUserAchievements } from "../controllers/achievement.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get user's achievements
router.get("/", protect, getUserAchievements);

export default router;
