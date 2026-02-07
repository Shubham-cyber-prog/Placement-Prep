import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ['badge', 'streak'], required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, default: 0 },
    earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for efficient queries
achievementSchema.index({ user: 1, type: 1 });

export default mongoose.model("Achievement", achievementSchema);
