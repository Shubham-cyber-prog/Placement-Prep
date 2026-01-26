import express from "express";
import { getRankings, getUserRankingDetails } from "../controllers/ranking.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all rankings (leaderboard)
router.get("/", protect, getRankings);

// Get current user's ranking details
router.get("/me", protect, getUserRankingDetails);

export default router;
