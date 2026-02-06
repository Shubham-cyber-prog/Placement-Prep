import Discussion from "../models/Discussion.model.js";
import Group from "../models/Group.model.js";
import mongoose from "mongoose";

// Create a new discussion
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, groupId, problemId, tags, attachments } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }
    
    // Check if group exists if provided
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found"
        });
      }
      
      // Check if user is a member of the group
      if (!group.members.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You must be a member of the group to post discussions"
        });
      }
    }
    
    const discussion = new Discussion({
      title,
      content,
      author: req.user._id,
      group: groupId || null,
      problem: problemId || null,
      tags: tags || [],
      attachments: attachments || []
    });
    
    await discussion.save();
    await discussion.populate('author', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: discussion,
      message: "Discussion created successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create discussion",
      error: error.message
    });
  }
};

// Get all discussions with filters
export const getDiscussions = async (req, res) => {
  try {
    const { 
      search, 
      tag, 
      groupId, 
      problemId, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tag filter
    if (tag) {
      query.tags = tag;
    }
    
    // Group filter
    if (groupId) {
      query.group = groupId;
    }
    
    // Problem filter
    if (problemId) {
      query.problem = problemId;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const discussions = await Discussion.find(query)
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .populate('problem', 'title difficulty')
      .populate('comments.author', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Discussion.countDocuments(query);
    
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
      message: "Failed to fetch discussions",
      error: error.message
    });
  }
};

// Search discussions
export const searchDiscussions = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const discussions = await Discussion.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .populate('problem', 'title difficulty')
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Discussion.countDocuments({ $text: { $search: q } });
    
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
      message: "Failed to search discussions",
      error: error.message
    });
  }
};

// Get popular discussions
export const getPopularDiscussions = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));
    
    const discussions = await Discussion.find({
      createdAt: { $gte: date }
    })
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .sort({ views: -1, likeCount: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular discussions",
      error: error.message
    });
  }
};

// Get discussions by problem
export const getDiscussionsByProblem = async (req, res) => {
  try {
    const discussions = await Discussion.find({ problem: req.params.problemId })
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem discussions",
      error: error.message
    });
  }
};

// Get discussions by group
export const getDiscussionsByGroup = async (req, res) => {
  try {
    const discussions = await Discussion.find({ group: req.params.groupId })
      .populate('author', 'name avatar')
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch group discussions",
      error: error.message
    });
  }
};

// Get discussion details
export const getDiscussionDetails = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('group', 'name description')
      .populate('problem', 'title difficulty description')
      .populate('comments.author', 'name avatar')
      .populate('solutionComment');
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    // Check if user has liked the discussion
    const hasLiked = discussion.likes.some(like => 
      like.toString() === req.user._id.toString()
    );
    
    res.json({
      success: true,
      data: {
        discussion,
        hasLiked,
        isAuthor: discussion.author._id.toString() === req.user._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussion details",
      error: error.message
    });
  }
};

// Update discussion
export const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if user is the author
    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the author can update the discussion"
      });
    }
    
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'author' && key !== 'comments' && key !== 'likes' && key !== 'views') {
        discussion[key] = updates[key];
      }
    });
    
    await discussion.save();
    await discussion.populate('author', 'name avatar');
    
    res.json({
      success: true,
      data: discussion,
      message: "Discussion updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update discussion",
      error: error.message
    });
  }
};

// Delete discussion
export const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if user is the author
    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the author can delete the discussion"
      });
    }
    
    await Discussion.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Discussion deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete discussion",
      error: error.message
    });
  }
};

// Like discussion
export const likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if user already liked the discussion
    if (discussion.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You already liked this discussion"
      });
    }
    
    discussion.likes.push(req.user._id);
    await discussion.save();
    
    res.json({
      success: true,
      message: "Discussion liked successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to like discussion",
      error: error.message
    });
  }
};

// Unlike discussion
export const unlikeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if user has liked the discussion
    if (!discussion.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this discussion"
      });
    }
    
    discussion.likes = discussion.likes.filter(like => 
      like.toString() !== req.user._id.toString()
    );
    await discussion.save();
    
    res.json({
      success: true,
      message: "Discussion unliked successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unlike discussion",
      error: error.message
    });
  }
};

// Get discussion comments
export const getDiscussionComments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const discussion = await Discussion.findById(req.params.id)
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar'
        },
        options: {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      });
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    const total = discussion.comments ? discussion.comments.length : 0;
    
    res.json({
      success: true,
      data: {
        comments: discussion.comments || [],
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
      message: "Failed to fetch comments",
      error: error.message
    });
  }
};

// Add comment to discussion
export const addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }
    
    // Check if discussion is locked
    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: "This discussion is locked for new comments"
      });
    }
    
    const comment = {
      content,
      author: req.user._id,
      parentComment: parentCommentId || null,
      createdAt: new Date()
    };
    
    discussion.comments.push(comment);
    await discussion.save();
    
    // Populate the newly added comment
    const newComment = discussion.comments[discussion.comments.length - 1];
    await discussion.populate({
      path: 'comments',
      match: { _id: newComment._id },
      populate: { path: 'author', select: 'name avatar' }
    });
    
    res.json({
      success: true,
      data: discussion.comments[discussion.comments.length - 1],
      message: "Comment added successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }
    
    const discussion = await Discussion.findOne({
      _id: req.params.id,
      'comments._id': req.params.commentId
    });
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }
    
    const comment = discussion.comments.id(req.params.commentId);
    
    // Check if user is the comment author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the comment author can update the comment"
      });
    }
    
    comment.content = content;
    await discussion.save();
    
    res.json({
      success: true,
      message: "Comment updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const discussion = await Discussion.findOne({
      _id: req.params.id,
      'comments._id': req.params.commentId
    });
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }
    
    const comment = discussion.comments.id(req.params.commentId);
    
    // Check if user is the comment author or discussion author
    if (comment.author.toString() !== req.user._id.toString() && 
        discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this comment"
      });
    }
    
    comment.remove();
    await discussion.save();
    
    res.json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message
    });
  }
};