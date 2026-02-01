import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeProblem", required: true },
    completionStatus: { type: String, enum: ['started', 'completed'], default: 'started' },
    timeSpent: { type: Number, default: 0 }, // in seconds
    attempts: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    pointsEarned: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
}, { timestamps: true });

// Compound index to ensure one progress entry per user-problem
progressSchema.index({ user: 1, problem: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
