import express from "express";
import ActivityController from "../controllers/activityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Record a new activity
router.post("/record", ActivityController.recordActivity);

// Record test session
router.post("/test-session", ActivityController.recordTestSession);

// Get user activities with filters
router.get("/", ActivityController.getUserActivities);

// Get user test sessions
router.get("/test-sessions", ActivityController.getUserTestSessions);

// Get performance analytics
router.get("/analytics", ActivityController.getUserPerformanceAnalytics);

// Get activity summary for dashboard
router.get("/summary", ActivityController.getActivitySummary);

// Get activity heatmap
router.get("/heatmap", ActivityController.getActivityHeatmap);

// Process batch activities
router.post("/batch", ActivityController.processBatchActivities);

// Export activities (CSV/JSON)
router.get("/export", ActivityController.exportActivities);

// Cleanup old activities (admin only)
router.delete("/cleanup", ActivityController.cleanupActivities);

// Get platform-wide analytics (admin only)
router.get("/platform-analytics", ActivityController.getPlatformAnalytics);

export default router;