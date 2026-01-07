import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { getTopics, createTopic } from "../controllers/topic.controller.js";

const router = express.Router();

router.get("/", protect, getTopics);
router.post("/", protect, createTopic);

export default router;
