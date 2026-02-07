import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeProblem" }, // Optional DSA problem
    codeState: { type: String, default: "" }, // Shared code content
    roomId: { type: String, unique: true, required: true }, // Unique room ID for socket.io
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
