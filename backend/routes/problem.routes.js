import express from "express";
import { getProblems, createProblem, toggleFavorite, markAsSolved, markAsUnsolved } from "../controllers/problem.controller.js";
import protect from "../middlewares/auth.middleware.js";
import { validate, validateParams, createProblemSchema, problemIdSchema } from "../utils/validators.js";

const router = express.Router();

router.get("/", protect, getProblems);
router.post("/", protect, validate(createProblemSchema), createProblem);
router.put("/:id/toggle-favorite", protect, validateParams(problemIdSchema), toggleFavorite);
router.put("/:id/mark-solved", protect, validateParams(problemIdSchema), markAsSolved);
router.put("/:id/mark-unsolved", protect, validateParams(problemIdSchema), markAsUnsolved);

export default router;
