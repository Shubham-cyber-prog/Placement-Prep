import express from "express";
import { createSession, getSessions, joinSession, leaveSession, endSession } from "../controllers/session.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All session routes require authentication
router.use(protect);

router.post("/", createSession);
router.get("/", getSessions);
router.post("/:id/join", joinSession);
router.post("/:id/leave", leaveSession);
router.post("/:id/end", endSession);

export default router;
