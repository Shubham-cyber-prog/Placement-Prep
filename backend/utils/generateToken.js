import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    // Uses the secret from your .env or a fallback for the session
    return jwt.sign({ id }, process.env.JWT_SECRET || "secret_fallback", {
        expiresIn: "30d",
    });
};