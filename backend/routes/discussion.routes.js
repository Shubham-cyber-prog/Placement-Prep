import express from "express";
import {
  createDiscussion,
  getDiscussions,
  getDiscussionDetails,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  updateComment,
  deleteComment,
  likeDiscussion,
  unlikeDiscussion,
  getDiscussionComments,
  searchDiscussions,
  getPopularDiscussions,
  getDiscussionsByProblem,
  getDiscussionsByGroup
} from "../controllers/discussion.controller.js";
import { authMiddleware as protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Discussion CRUD operations
router.post("/", createDiscussion);
router.get("/", getDiscussions);
router.get("/search", searchDiscussions);
router.get("/popular", getPopularDiscussions);
router.get("/problem/:problemId", getDiscussionsByProblem);
router.get("/group/:groupId", getDiscussionsByGroup);
router.get("/:id", getDiscussionDetails);
router.put("/:id", updateDiscussion);
router.delete("/:id", deleteDiscussion);

// Discussion interactions
router.post("/:id/like", likeDiscussion);
router.delete("/:id/like", unlikeDiscussion);

// Comments
router.get("/:id/comments", getDiscussionComments);
router.post("/:id/comments", addComment);
router.put("/:id/comments/:commentId", updateComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;