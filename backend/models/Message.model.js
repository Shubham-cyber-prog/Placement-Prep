import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    attachments: [{
        url: String,
        filename: String,
        filetype: String,
        size: Number
    }],
    emojis: [{
        emoji: String,
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for fetching messages
messageSchema.index({ group: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);