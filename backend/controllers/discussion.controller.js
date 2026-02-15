import Discussion from "../models/Discussion.model.js";
import Group from "../models/Group.model.js";
import mongoose from "mongoose";

// Create a new discussion
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, groupId, problemId, tags, attachments } = req.body;
    
    console.log('Received discussion data:', {
      title: title ? `Present (${title.length} chars)` : 'Missing',
      content: content ? `Present (${content.length} chars)` : 'Missing',
      groupId,
      problemId,
      tags,
      hasUser: !!req.user?._id
    });
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }
    
    // Check if group exists if provided
    if (groupId && groupId.trim()) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found"
        });
      }
      
      const isMember = group.members.some(member => 
        member._id.toString() === req.user._id.toString()
      );
      
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "You must be a member of the group to post discussions"
        });
      }
    }
    
    // Prepare tags array
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    
    const discussion = new Discussion({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
      group: groupId && groupId.trim() ? groupId : null,
      problem: problemId && problemId.trim() ? problemId : null,
      tags: tagsArray,
      attachments: attachments || []
    });
    
    await discussion.save();
    await discussion.populate('author', 'name avatar');
    
    console.log('Discussion created successfully:', discussion._id);
    
    res.status(201).json({
      success: true,
      data: discussion,
      message: "Discussion created successfully"
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create discussion",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all discussions with filters - UPDATED VERSION
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
    
    console.log('Fetching discussions with params:', {
      search, tag, groupId, problemId, sortBy, sortOrder, page, limit
    });
    
    let query = {};
    
    // Search filter
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tag filter
    if (tag && tag.trim()) {
      query.tags = tag;
    }
    
    // Group filter
    if (groupId && groupId.trim() && mongoose.Types.ObjectId.isValid(groupId)) {
      query.group = groupId;
    }
    
    // Problem filter
    if (problemId && problemId.trim() && mongoose.Types.ObjectId.isValid(problemId)) {
      query.problem = problemId;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query with safe population
    let queryBuilder = Discussion.find(query)
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .skip(skip)
      .limit(parseInt(limit));
    
    // Try to populate problem if available, otherwise skip it
    try {
      // Check if PracticeProblem model exists in mongoose registry
      const modelNames = mongoose.modelNames();
      if (modelNames.includes('PracticeProblem')) {
        queryBuilder = queryBuilder.populate('problem', 'title difficulty');
      } else {
        console.log('PracticeProblem model not registered, skipping population');
      }
    } catch (err) {
      console.log('Could not populate problem field:', err.message);
    }
    
    // Add comments population
    queryBuilder = queryBuilder.populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name avatar'
      },
      options: {
        limit: 3,
        sort: { createdAt: -1 }
      }
    });
    
    // Apply sorting
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'views') {
      queryBuilder = queryBuilder.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }
    
    const discussions = await queryBuilder.lean();
    
    // Get total count
    const total = await Discussion.countDocuments(query);
    
    // Calculate counts for lean documents
    const discussionsWithCounts = discussions.map(discussion => ({
      ...discussion,
      commentCount: discussion.comments ? discussion.comments.length : 0,
      likeCount: discussion.likes ? discussion.likes.length : 0,
      views: discussion.views || 0
    }));
    
    // Apply client-side sorting for virtual fields
    if (sortBy === 'popular') {
      discussionsWithCounts.sort((a, b) => 
        sortOrder === 'asc' ? (a.likeCount || 0) - (b.likeCount || 0) : (b.likeCount || 0) - (a.likeCount || 0)
      );
    } else if (sortBy === 'trending') {
      discussionsWithCounts.sort((a, b) => 
        sortOrder === 'asc' ? (a.views || 0) - (b.views || 0) : (b.views || 0) - (a.views || 0)
      );
    } else if (sortBy === 'comments') {
      discussionsWithCounts.sort((a, b) => 
        sortOrder === 'asc' ? (a.commentCount || 0) - (b.commentCount || 0) : (b.commentCount || 0) - (a.commentCount || 0)
      );
    }
    
    console.log(`Fetched ${discussionsWithCounts.length} discussions`);
    
    res.json({
      success: true,
      data: {
        discussions: discussionsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussions",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Search discussions - UPDATED
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
    
    let queryBuilder = Discussion.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Try to populate problem safely
    try {
      if (mongoose.modelNames().includes('PracticeProblem')) {
        queryBuilder = queryBuilder.populate('problem', 'title difficulty');
      }
    } catch (err) {
      console.log('Could not populate problem:', err.message);
    }
    
    const discussions = await queryBuilder;
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

// Get popular discussions - UPDATED
export const getPopularDiscussions = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    
    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));
    
    let queryBuilder = Discussion.find({
      createdAt: { $gte: date }
    })
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .sort({ views: -1 })
      .limit(parseInt(limit));
    
    // Try to populate problem safely
    try {
      if (mongoose.modelNames().includes('PracticeProblem')) {
        queryBuilder = queryBuilder.populate('problem', 'title difficulty');
      }
    } catch (err) {
      console.log('Could not populate problem:', err.message);
    }
    
    const discussions = await queryBuilder;
    
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

// Get discussions by problem - UPDATED
export const getDiscussionsByProblem = async (req, res) => {
  try {
    let queryBuilder = Discussion.find({ problem: req.params.problemId })
      .populate('author', 'name avatar')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    
    // Try to populate problem safely
    try {
      if (mongoose.modelNames().includes('PracticeProblem')) {
        queryBuilder = queryBuilder.populate('problem', 'title difficulty');
      }
    } catch (err) {
      console.log('Could not populate problem:', err.message);
    }
    
    const discussions = await queryBuilder;
    
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

// Get discussions by group - SINGLE CORRECTED VERSION
export const getDiscussionsByGroup = async (req, res) => {
  try {
    let discussions = await Discussion.find({ group: req.params.groupId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    // Try to populate problem if model exists
    try {
      if (mongoose.modelNames().includes('PracticeProblem')) {
        discussions = await Discussion.populate(discussions, { path: 'problem', select: 'title difficulty' });
      }
    } catch (err) {
      console.log('Could not populate problem:', err.message);
    }
    
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

// Get discussion details - UPDATED
export const getDiscussionDetails = async (req, res) => {
  try {
    let discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('group', 'name description')
      .populate('comments.author', 'name avatar')
      .populate('solutionComment');
    
    // Try to populate problem safely
    try {
      if (mongoose.modelNames().includes('PracticeProblem')) {
        discussion = await discussion.populate('problem', 'title difficulty description');
      }
    } catch (err) {
      console.log('Could not populate problem:', err.message);
    }
    
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