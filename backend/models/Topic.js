import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    name: String,
    category: { type: String, default: 'Technical' },
    total_hours: { type: Number, default: 0 },
    completed_hours: { type: Number, default: 0 },
    status: { type: String, default: 'Not Started' },
    priority: { type: String, default: 'Medium' },
    notes: String,
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Topic", topicSchema);
