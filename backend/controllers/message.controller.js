import Message from "../models/Message.model.js";
import Group from "../models/Group.model.js";

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, messageType, attachments, replyTo } = req.body;

        // Check if user is member of group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        const isMember = group.members.some(member => 
            member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // Create message
        const message = new Message({
            group: groupId,
            sender: req.user._id,
            content: content || "",
            messageType: messageType || 'text',
            attachments: attachments || [],
            replyTo: replyTo || null,
            readBy: [{
                user: req.user._id,
                readAt: new Date()
            }]
        });

        await message.save();

        // Update group stats
        group.stats = group.stats || {};
        group.stats.totalMessages = (group.stats.totalMessages || 0) + 1;
        await group.save();

        // Populate sender info
        await message.populate('sender', 'name email avatar');
        if (replyTo) {
            await message.populate('replyTo');
        }

        // Emit socket event
        if (req.io) {
            req.io.to(`group:${groupId}`).emit('newMessage', message);
        }

        res.status(201).json({
            success: true,
            data: message,
            message: "Message sent successfully"
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: error.message
        });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Check if user is member of group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        const isMember = group.members.some(member => 
            member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await Message.find({ 
            group: groupId,
            isDeleted: false 
        })
            .populate('sender', 'name email avatar')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Message.countDocuments({ 
            group: groupId,
            isDeleted: false 
        });

        res.json({
            success: true,
            data: {
                messages: messages.reverse(),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
            error: error.message
        });
    }
};

// Add emoji to message
export const addEmoji = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Check if user is member of the group
        const group = await Group.findById(message.group);
        const isMember = group.members.some(member => 
            member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // Check if emoji reaction exists
        let emojiReaction = message.emojis.find(e => e.emoji === emoji);
        
        if (emojiReaction) {
            // Check if user already reacted with this emoji
            const hasReacted = emojiReaction.users.some(
                user => user.toString() === req.user._id.toString()
            );

            if (hasReacted) {
                // Remove reaction
                emojiReaction.users = emojiReaction.users.filter(
                    user => user.toString() !== req.user._id.toString()
                );
                
                // Remove emoji if no users left
                if (emojiReaction.users.length === 0) {
                    message.emojis = message.emojis.filter(e => e.emoji !== emoji);
                }
            } else {
                // Add reaction
                emojiReaction.users.push(req.user._id);
            }
        } else {
            // Add new emoji reaction
            message.emojis.push({
                emoji,
                users: [req.user._id]
            });
        }

        await message.save();

        // Emit socket event
        if (req.io) {
            req.io.to(`group:${message.group}`).emit('messageUpdated', message);
        }

        res.json({
            success: true,
            data: message,
            message: "Emoji added successfully"
        });
    } catch (error) {
        console.error('Add emoji error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add emoji",
            error: error.message
        });
    }
};

// Edit message
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own messages"
            });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        // Emit socket event
        if (req.io) {
            req.io.to(`group:${message.group}`).emit('messageUpdated', message);
        }

        res.json({
            success: true,
            data: message,
            message: "Message edited successfully"
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to edit message",
            error: error.message
        });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Check if user is the sender or group creator
        const group = await Group.findById(message.group);
        const isCreator = group.creator.toString() === req.user._id.toString();
        
        if (message.sender.toString() !== req.user._id.toString() && !isCreator) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this message"
            });
        }

        // Soft delete
        message.isDeleted = true;
        message.content = "This message was deleted";
        message.attachments = [];
        await message.save();

        // Emit socket event
        if (req.io) {
            req.io.to(`group:${message.group}`).emit('messageDeleted', {
                messageId,
                groupId: message.group
            });
        }

        res.json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: error.message
        });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const { groupId } = req.params;

        await Message.updateMany(
            { 
                group: groupId,
                'readBy.user': { $ne: req.user._id }
            },
            {
                $push: {
                    readBy: {
                        user: req.user._id,
                        readAt: new Date()
                    }
                }
            }
        );

        res.json({
            success: true,
            message: "Messages marked as read"
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to mark messages as read",
            error: error.message
        });
    }
};