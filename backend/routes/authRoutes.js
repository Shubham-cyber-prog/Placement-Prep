import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      isEmailVerified: false
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-2024",
      { expiresIn: "7d" }
    );

    // Get user without password
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating account. Please try again."
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, "i") } 
    }).select("+password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-2024",
      { expiresIn: "7d" }
    );

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Get user without sensitive data
    const userResponse = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again."
    });
  }
});

// Demo login endpoint
router.post("/demo-login", async (req, res) => {
  try {
    // Find or create demo user
    let user = await User.findOne({ email: "demo@example.com" });
    
    if (!user) {
      user = new User({
        name: "Demo User",
        email: "demo@example.com",
        password: "demo123",
        isEmailVerified: true,
        profile: {
          bio: "This is a demo account to explore the platform",
          location: "San Francisco, CA",
          skills: ["JavaScript", "React", "Node.js", "Python", "Data Structures"]
        }
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-2024",
      { expiresIn: "24h" }
    );

    // Get user without password
    const userResponse = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Demo login successful",
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error("Demo login error:", error);
    res.status(500).json({
      success: false,
      message: "Error with demo login"
    });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-2024");
    
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get user error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error fetching user"
    });
  }
});

// Logout endpoint (client-side token clearing)
router.post("/logout", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-2024");
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update allowed fields
    const allowedUpdates = ["name", "avatarUrl", "profile", "preferences"];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const userResponse = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
});

export default router;