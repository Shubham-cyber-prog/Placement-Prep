// models/Group.model.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    description: { 
        type: String,
        trim: true,
        maxlength: 500
    },
    creator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    maxMembers: {
        type: Number,
        default: 10,
        min: 2,
        max: 100
    },
    featuredImage: {
        type: String,
        default: ""
    },
    rules: [{
        title: String,
        description: String
    }],
    schedule: {
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        time: String,
        timezone: String
    },
    stats: {
        totalProblemsSolved: {
            type: Number,
            default: 0
        },
        activeMembers: {
            type: Number,
            default: 0
        },
        sessionsCompleted: {
            type: Number,
            default: 0
        },
        totalMessages: {
            type: Number,
            default: 0
        }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
    return this.members ? this.members.length : 0;
});

// Indexes for better query performance
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });
groupSchema.index({ creator: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ createdAt: -1 });
groupSchema.index({ 'stats.totalProblemsSolved': -1 });

// Pre-save middleware to ensure creator is in members
groupSchema.pre('save', function(next) {
    if (this.isNew && !this.members.includes(this.creator)) {
        this.members.push(this.creator);
    }
    next();
});

export default mongoose.model("Group", groupSchema);