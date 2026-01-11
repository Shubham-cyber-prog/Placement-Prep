import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    title: String,
    difficulty: String,
    solved: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false }, // Issue #62
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("PracticeProblem", problemSchema);
