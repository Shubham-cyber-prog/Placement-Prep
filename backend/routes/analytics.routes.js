import express from "express";
import {
  getUserAnalytics,
  getPerformanceTrends,
  getWeakAreas,
  getComparisonStats,
  getStudyPlanProgress,
  getInterviewReadiness,
  getCategoryWiseAnalytics,
  getTimeSpentAnalytics,
  getGoalTracking,
  getHeatmapData
} from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/user", getUserAnalytics);
router.get("/trends", getPerformanceTrends);
router.get("/weak-areas", getWeakAreas);
router.get("/comparison", getComparisonStats);
router.get("/study-plan", getStudyPlanProgress);
router.get("/readiness", getInterviewReadiness);
router.get("/categories", getCategoryWiseAnalytics);
router.get("/time-spent", getTimeSpentAnalytics);
router.get("/goals", getGoalTracking);
router.get("/heatmap", getHeatmapData);

export default router;