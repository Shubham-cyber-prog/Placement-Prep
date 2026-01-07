import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bio: String,
        company: String,
        location: String,
        skills: [String],
    },
    { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
