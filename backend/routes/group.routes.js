import express from "express";
import { createGroup, getGroups, joinGroup, leaveGroup } from "../controllers/group.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.post("/:id/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);

export default router;
