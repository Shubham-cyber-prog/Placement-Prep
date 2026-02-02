import express from "express";
import { createDiscussion, getDiscussions, addComment } from "../controllers/discussion.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createDiscussion);
router.get("/", protect, getDiscussions);
router.post("/:id/comment", protect, addComment);

export default router;
