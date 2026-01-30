import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token
export const protect = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"
    );
    
    // Make sure we have the user ID
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }
    
    res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

// Optional: Admin middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
};