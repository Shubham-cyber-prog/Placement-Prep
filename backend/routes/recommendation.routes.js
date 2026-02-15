import express from "express";
import { 
    getRecommendations, 
    refreshRecommendations,
    generatePersonalizedPath,
    getBatchProgress,
    updateProgress
} from "../controllers/recommendation.controller.js";
// Change this import - use protect middleware, not adminMiddleware
import { authMiddleware } from "../middleware/authMiddleware.js";  // FIXED: use protect, not adminMiddleware

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);  // FIXED: using authMiddleware middleware

// Get personalized recommendations (with pagination)
router.get("/", getRecommendations);

// Get batch progress for items
router.post("/progress/batch", getBatchProgress);

// Update progress for an item
router.post("/progress/update", updateProgress);

// Refresh recommendations (force regenerate)
router.post("/refresh", refreshRecommendations);

// Generate personalized learning path
router.post("/generate-path", generatePersonalizedPath);

export default router;