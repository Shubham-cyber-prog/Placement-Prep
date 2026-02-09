import express from "express";
import { 
    getUserAchievements,
    getAchievementById,
    getAchievementStats,
    getAchievementLeaderboard
} from "../controllers/achievement.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's achievements with filters
router.get("/", getUserAchievements);

// Get specific achievement
router.get("/:id", getAchievementById);

// Get achievement statistics for dashboard
router.get("/stats/summary", getAchievementStats);

// Get achievement leaderboard
router.get("/leaderboard", getAchievementLeaderboard);

export default router;