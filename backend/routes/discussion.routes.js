import express from "express";
import Discussion from "../models/Discussion.model.js"; // ADD THIS IMPORT
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

// Debug route
router.get('/debug/test', async (req, res) => {
  try {
    console.log('Debug route hit, user:', req.user?._id);
    
    // Test basic database connection
    const dbStatus = mongoose.connection.readyState;
    console.log('Database connection status:', dbStatus);
    
    // Test if we can fetch discussions without population
    const simpleDiscussions = await Discussion.find({})
      .limit(5)
      .select('title author createdAt')
      .lean();
    
    console.log('Simple discussions found:', simpleDiscussions.length);
    
    res.json({
      success: true,
      data: {
        discussions: simpleDiscussions,
        dbStatus: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus],
        user: req.user ? req.user._id : 'No user',
        timestamp: new Date().toISOString()
      },
      message: "Debug test successful"
    });
  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({
      success: false,
      message: "Debug test failed",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Discussion interactions
router.post("/:id/like", likeDiscussion);
router.delete("/:id/like", unlikeDiscussion);

// Comments
router.get("/:id/comments", getDiscussionComments);
router.post("/:id/comments", addComment);
router.put("/:id/comments/:commentId", updateComment);
router.delete("/:id/comments/:commentId", deleteComment);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Route error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default router;