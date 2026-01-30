import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    title: String,
    difficulty: String,
    solved: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false }, // Issue #62
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    solvedDate: { type: Date, default: null }, // When the problem was solved
}, { timestamps: true });

export default mongoose.model("PracticeProblem", problemSchema);
