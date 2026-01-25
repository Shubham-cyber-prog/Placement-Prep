import express from "express";
import {
  getAIResponse,
  analyzeCode,
  generateQuestions,
  evaluateAnswer,
  getInterviewTipsAI,
  mockInterviewAI,
  getPersonalizedPlan,
  getExplanation,
  getCodeReview,
  getBehavioralAnalysis
} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/chat", getAIResponse);
router.post("/analyze-code", analyzeCode);
router.post("/generate-questions", generateQuestions);
router.post("/evaluate-answer", evaluateAnswer);
router.post("/interview-tips", getInterviewTipsAI);
router.post("/mock-interview", mockInterviewAI);
router.post("/personalized-plan", getPersonalizedPlan);
router.post("/explanation", getExplanation);
router.post("/code-review", getCodeReview);
router.post("/behavioral-analysis", getBehavioralAnalysis);

export default router;