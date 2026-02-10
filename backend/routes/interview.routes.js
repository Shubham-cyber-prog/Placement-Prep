import express from "express";
import {
  getMockInterview,
  scheduleInterview,
  cancelInterview,
  getInterviewHistory,
  submitInterviewResponse,
  getInterviewAnalytics,
  getInterviewQuestions,
  simulateInterview,
  getInterviewTips,
  saveInterviewRecording,
  getInterviewFeedback,
  getRecommendedInterviews
} from "../controllers/interview.controller.js";
import { adminMiddleware as protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Mock interview routes
router.get("/mock", getMockInterview);
router.get("/questions", getInterviewQuestions);
router.get("/tips", getInterviewTips);

// Interview scheduling and management
router.post("/schedule", scheduleInterview);
router.post("/:id/cancel", cancelInterview);
router.get("/history", getInterviewHistory);
router.get("/recommended", getRecommendedInterviews);

// Interview simulation and submission
router.post("/simulate", simulateInterview);
router.post("/submit", submitInterviewResponse);
router.post("/recording", saveInterviewRecording);

// Analytics and feedback
router.get("/analytics", getInterviewAnalytics);
router.get("/:id/feedback", getInterviewFeedback);

export default router;