import express from "express";
import { getProblems, createProblem } from "../controllers/problem.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getProblems);
router.post("/", protect, createProblem);

export default router;
