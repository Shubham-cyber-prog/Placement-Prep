import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
    const { fullName, name, email, password } = req.body;
    const displayName = fullName || name;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({ name: displayName, email, password });
    await Profile.create({ user: user._id });

    res.json({
        user,
        token: generateToken(user._id),
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
        user,
        token: generateToken(user._id),
    });
};

export const me = async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    res.json({ user: req.user });
};
