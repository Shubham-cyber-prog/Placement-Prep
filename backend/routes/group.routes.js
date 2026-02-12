// routes/group.routes.js
import express from "express";
import {
  createGroup,
  getGroups,
  joinGroup,
  leaveGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  inviteToGroup,
  removeFromGroup,
  getGroupDiscussions,
  getGroupProblems,
  addProblemToGroup,
  scheduleGroupSession
} from "../controllers/group.controller.js";
import { authMiddleware as protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Group CRUD operations
router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroupDetails);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

// Group membership
router.post("/:id/join", joinGroup);
router.post("/:id/leave", leaveGroup);
router.get("/:id/members", getGroupMembers);
router.post("/:id/invite", inviteToGroup);
router.delete("/:id/members/:userId", removeFromGroup);

// Group content
router.get("/:id/discussions", getGroupDiscussions);
router.get("/:id/problems", getGroupProblems);
router.post("/:id/problems", addProblemToGroup);

// Group sessions
router.post("/:id/sessions", scheduleGroupSession);

export default router;