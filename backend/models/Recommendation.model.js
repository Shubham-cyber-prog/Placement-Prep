import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ['problem', 'topic', 'difficulty'], required: true },
    recommendedItem: { type: mongoose.Schema.Types.ObjectId, refPath: 'type', required: true }, // Can reference Problem or Topic
    reason: { type: String, required: true }, // e.g., "Based on your strength in Easy problems"
    confidence: { type: Number, min: 0, max: 1, default: 0.5 }, // Confidence score 0-1
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expires in 7 days
}, { timestamps: true });

// Index for efficient queries
recommendationSchema.index({ user: 1, type: 1, isActive: 1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiry

export default mongoose.model("Recommendation", recommendationSchema);
