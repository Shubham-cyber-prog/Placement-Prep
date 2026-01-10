import express from "express";
import { getProfile, updateProfile, getProfileStats } from "../controllers/profile.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.get("/stats", protect, getProfileStats); // New Stats Route matching Issue #50

export default router;
