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
// backend/routes/groupRoutes.js or similar
router.get('/:id', protect, async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Find the group WITHOUT populating 'problems'
    const group = await Group.findById(groupId)
      .populate('creator', 'name email') // Only populate creator
      .populate('members', 'name email') // Only populate members
      // REMOVE THIS LINE: .populate('problems')
      .lean();
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user is member
    const userId = req.user.id;
    const isMember = group.members.some(
      member => member._id.toString() === userId
    );
    
    res.json({
      success: true,
      data: {
        group,
        isMember
      }
    });
    
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details',
      error: error.message
    });
  }
});
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