import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the authorization header exists and starts with "Bearer"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // 2. Extract the token from the "Bearer <token>" string
            token = req.headers.authorization.split(" ")[1];

            // 3. Verify the token using your JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_fallback");

            // 4. Find the user in the database and attach it to the request (excluding password)
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export default protect;