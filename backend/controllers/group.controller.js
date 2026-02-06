import Group from "../models/Group.model.js";
import Discussion from "../models/Discussion.model.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, tags, isPublic, maxMembers, schedule, rules } = req.body;
    
    const group = new Group({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id],
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      maxMembers: maxMembers || 10,
      schedule: schedule || null,
      rules: rules || [],
      featuredImage: req.body.featuredImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
    });

    await group.save();
    
    // Populate creator info
    await group.populate('creator', 'name email avatar');
    
    res.status(201).json({
      success: true,
      data: group,
      message: "Group created successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: error.message
    });
  }
};

// Get all groups with filters
export const getGroups = async (req, res) => {
  try {
    const { 
      search, 
      tag, 
      isPublic, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tag filter
    if (tag) {
      query.tags = tag;
    }
    
    // Public filter
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const groups = await Group.find(query)
      .populate('creator', 'name email avatar')
      .populate('members', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Group.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        groups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message
    });
  }
};

// Get group details
// In your backend group.controller.js - getGroupDetails function
export const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email avatar bio')
      .populate('members', 'name email avatar bio')
      // REMOVE THIS LINE if it exists:
      // .populate('problems', 'title difficulty tags')
      .lean(); // Add lean() for better performance
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is a member
    const isMember = group.members.some(member => 
      member._id.toString() === req.user._id.toString()
    );
    
    // Only show full details to members for private groups
    if (!group.isPublic && !isMember && group.creator._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "This group is private. Request an invite to join."
      });
    }
    
    res.json({
      success: true,
      data: {
        group,
        isMember,
        isCreator: group.creator._id.toString() === req.user._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group details",
      error: error.message
    });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is the creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can update the group"
      });
    }
    
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'creator' && key !== 'members') {
        group[key] = updates[key];
      }
    });
    
    await group.save();
    await group.populate('creator', 'name email avatar');
    
    res.json({
      success: true,
      data: group,
      message: "Group updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message
    });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is the creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can delete the group"
      });
    }
    
    // Delete associated discussions
    await Discussion.deleteMany({ group: group._id });
    
    await Group.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Group deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
      error: error.message
    });
  }
};

// Join group
// In your backend group.controller.js
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Debug: Log user IDs
    console.log('User ID:', req.user._id);
    console.log('Group members:', group.members);
    console.log('Is user already member?', group.members.includes(req.user._id));
    
    // Check if user is already a member
    const isAlreadyMember = group.members.some(member => 
      member.toString() === req.user._id.toString()
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this group"
      });
    }
    
    // Check if group is private
    if (!group.isPublic) {
      return res.status(403).json({
        success: false,
        message: "This group is private. Request an invite to join."
      });
    }
    
    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Group is full"
      });
    }
    
    // Add user to group
    group.members.push(req.user._id);
    await group.save();
    
    // Populate the updated group
    await group.populate('creator', 'name email avatar');
    await group.populate('members', 'name email avatar');
    
    res.json({
      success: true,
      message: "Joined group successfully",
      data: group
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to join group",
      error: error.message
    });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is the creator
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Group creator cannot leave the group. Transfer ownership or delete the group."
      });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this group"
      });
    }
    
    group.members = group.members.filter(member => 
      member.toString() !== req.user._id.toString()
    );
    
    await group.save();
    
    res.json({
      success: true,
      message: "Left group successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to leave group",
      error: error.message
    });
  }
};

// Get group members
export const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email avatar bio joinedAt');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    res.json({
      success: true,
      data: group.members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch group members",
      error: error.message
    });
  }
};

// Invite to group
export const inviteToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is the creator or has permission
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can invite members"
      });
    }
    
    // Check if user exists
    const userToInvite = await User.findById(userId);
    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this group"
      });
    }
    
    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Group is full"
      });
    }
    
    // In a real app, you would send an invitation notification here
    // For now, just add the user
    group.members.push(userId);
    await group.save();
    
    res.json({
      success: true,
      message: "User invited to group successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to invite user",
      error: error.message
    });
  }
};

// Remove from group
export const removeFromGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is the creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can remove members"
      });
    }
    
    // Check if trying to remove creator
    if (req.params.userId === group.creator.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove group creator"
      });
    }
    
    // Remove user from group
    group.members = group.members.filter(member => 
      member.toString() !== req.params.userId
    );
    
    await group.save();
    
    res.json({
      success: true,
      message: "User removed from group successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove user",
      error: error.message
    });
  }
};

// Get group discussions
export const getGroupDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const discussions = await Discussion.find({ group: req.params.id })
      .populate('author', 'name avatar')
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Discussion.countDocuments({ group: req.params.id });
    
    res.json({
      success: true,
      data: {
        discussions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch group discussions",
      error: error.message
    });
  }
};

// Add problem to group
export const addProblemToGroup = async (req, res) => {
  try {
    const { problemId } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only group members can add problems"
      });
    }
    
    // Check if problem already exists in group
    if (group.problems.includes(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Problem already added to group"
      });
    }
    
    group.problems.push(problemId);
    await group.save();
    
    res.json({
      success: true,
      message: "Problem added to group successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add problem to group",
      error: error.message
    });
  }
};

// Schedule group study session
export const scheduleGroupSession = async (req, res) => {
  try {
    const { title, description, dateTime, duration, agenda } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only group members can schedule sessions"
      });
    }
    
    // Create session (in a real app, you'd have a Session model)
    const session = {
      title,
      description,
      dateTime: new Date(dateTime),
      duration,
      agenda: agenda || [],
      createdBy: req.user._id,
      attendees: [req.user._id],
      status: 'scheduled'
    };
    
    // Add session to group (you might want to store this in a separate collection)
    // For now, we'll just return success
    
    res.json({
      success: true,
      data: session,
      message: "Study session scheduled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to schedule session",
      error: error.message
    });
  }
};

// Get group problems
export const getGroupProblems = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('problems', 'title difficulty tags description');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    res.json({
      success: true,
      data: group.problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch group problems",
      error: error.message
    });
  }
};