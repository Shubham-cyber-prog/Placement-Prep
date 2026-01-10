import express from "express";
import protect from "../middlewares/auth.middleware.js";
// Assuming limited topic logic for now
const router = express.Router();

router.get("/", protect, (req, res) => res.json({ message: "Topic routes placeholder" }));

export default router;
