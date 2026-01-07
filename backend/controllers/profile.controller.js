import Profile from "../models/Profile.js";

export const getMyProfile = async (req, res) => {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "name email");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
};
