import express from "express";
import { getProblems, createProblem, toggleFavorite, markAsSolved, markAsUnsolved } from "../controllers/problem.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getProblems);
router.post("/", protect, createProblem);
router.put("/:id/toggle-favorite", protect, toggleFavorite);
router.put("/:id/mark-solved", protect, markAsSolved);
router.put("/:id/mark-unsolved", protect, markAsUnsolved);

export default router;
