import express from "express";
import { getRecommendations, refreshRecommendations } from "../controllers/recommendation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get personalized recommendations
router.get("/", getRecommendations);

// Refresh recommendations (force regenerate)
router.post("/refresh", refreshRecommendations);

export default router;
