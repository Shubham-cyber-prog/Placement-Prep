import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res, next) => {
    try {
        const { fullName, name, email, password } = req.body;
        const displayName = fullName || name;

        const exists = await User.findOne({ email });
        if (exists) {
            const error = new Error("User already exists");
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.create({ name: displayName, email, password });
        await Profile.create({ user: user._id });

        res.json({
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            return next(error);
        }

        res.json({
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

export const me = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error("Not authenticated");
            error.statusCode = 401;
            return next(error);
        }
        res.json({ user: req.user });
    } catch (error) {
        next(error);
    }
};

// Firebase token verification and JWT generation
export const firebaseAuth = async (req, res, next) => {
    try {
        const { firebaseUID, email, name } = req.body;

        if (!firebaseUID || !email) {
            const error = new Error("Missing required fields");
            error.statusCode = 400;
            return next(error);
        }

        // Find or create user with Firebase UID
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user synced from Firebase
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: `firebase_${firebaseUID}`, // Placeholder password
                firebaseUID // Store Firebase UID for reference
            });
            await Profile.create({ user: user._id });
        }

        // Generate JWT token for backend API
        const token = generateToken(user._id);

        res.json({
            user,
            token,
            message: "Successfully authenticated with Firebase"
        });
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        next(error);
    }
};
