import express from "express";
import { 
  getUserProgress, 
  recordTestResult, 
  updateSkill, 
  getAnalytics,
  getProgressSummary
} from "../controllers/progressController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Get user progress
router.get("/", getUserProgress);

// Record test result
router.post("/test", recordTestResult);

// Update skill proficiency
router.put("/skill", updateSkill);

// Get progress analytics
router.get("/analytics", getAnalytics);

// Get progress summary for dashboard
router.get("/summary", getProgressSummary);

export default router;