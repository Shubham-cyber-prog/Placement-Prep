import express from "express";
import { getProblems, createProblem, toggleFavorite } from "../controllers/problem.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getProblems);
router.post("/", protect, createProblem);
router.put("/:id/toggle-favorite", protect, toggleFavorite);

export default router;
