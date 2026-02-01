import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "PracticeProblem" }],
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);
