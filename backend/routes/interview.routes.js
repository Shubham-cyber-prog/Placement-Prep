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
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes protected
router.use(protect);

router.get("/mock", getMockInterview);
router.get("/history", getInterviewHistory);
router.get("/analytics", getInterviewAnalytics);
router.get("/questions", getInterviewQuestions);
router.get("/tips", getInterviewTips);
router.get("/feedback/:id", getInterviewFeedback);
router.get("/recommended", getRecommendedInterviews);

router.post("/schedule", scheduleInterview);
router.post("/simulate", simulateInterview);
router.post("/submit", submitInterviewResponse);
router.post("/recording", saveInterviewRecording);

router.patch("/cancel/:id", cancelInterview);

export default router;