import Discussion from "../models/Discussion.model.js";
import Group from "../models/Group.model.js";

// Create a new discussion
export const createDiscussion = async (req, res, next) => {
    try {
        const { title, content, groupId, problemId } = req.body;
        const discussion = new Discussion({
            title,
            content,
            author: req.user._id,
            group: groupId,
            problem: problemId
        });
        await discussion.save();
        res.status(201).json({ success: true, discussion });
    } catch (error) {
        next(error);
    }
};

// Get all discussions
export const getDiscussions = async (req, res, next) => {
    try {
        const discussions = await Discussion.find()
            .populate('author', 'name')
            .populate('group', 'name')
            .populate('problem', 'title')
            .populate('comments.author', 'name');
        res.json({ success: true, discussions });
    } catch (error) {
        next(error);
    }
};

// Add a comment to a discussion
export const addComment = async (req, res, next) => {
    try {
        const { content } = req.body;
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ success: false, message: "Discussion not found" });
        discussion.comments.push({ content, author: req.user._id });
        await discussion.save();
        res.json({ success: true, message: "Comment added successfully" });
    } catch (error) {
        next(error);
    }
};
