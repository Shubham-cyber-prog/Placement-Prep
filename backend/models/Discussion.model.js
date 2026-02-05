import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    content: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 5000
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    group: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Group" 
    },
    problem: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "PracticeProblem" 
    },
    tags: [{
        type: String,
        trim: true
    }],
    comments: [{
        content: { 
            type: String, 
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000
        },
        author: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Discussion.comments'
        },
        isSolution: {
            type: Boolean,
            default: false
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    solutionComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion.comments'
    },
    attachments: [{
        url: String,
        filename: String,
        filetype: String,
        size: Number
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals for computed properties
discussionSchema.virtual('commentCount').get(function() {
    return this.comments ? this.comments.length : 0;
});

discussionSchema.virtual('likeCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Indexes for better query performance
discussionSchema.index({ title: 'text', content: 'text', tags: 'text' });
discussionSchema.index({ author: 1 });
discussionSchema.index({ group: 1 });
discussionSchema.index({ problem: 1 });
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ likes: -1 });
discussionSchema.index({ views: -1 });
discussionSchema.index({ 'comments.createdAt': -1 });

// Pre-save middleware to update views
discussionSchema.pre('save', function(next) {
    if (this.isNew) {
        this.views = 0;
    }
    next();
});

export default mongoose.model("Discussion", discussionSchema);