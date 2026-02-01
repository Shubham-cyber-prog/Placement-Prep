import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Firebase authentication endpoint
router.post("/firebase", async (req, res) => {
  try {
    const { firebaseUID, email, name } = req.body;

    if (!firebaseUID || !email) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and email are required"
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from Firebase
      user = new User({
        name: name || email.split('@')[0],
        email,
        isOAuth: true,
        oauthProvider: 'google',
        oauthId: firebaseUID,
        isEmailVerified: true,
        password: 'oauth-user-' + firebaseUID // Placeholder
      });
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({
      success: false,
      message: "Error processing Firebase authentication"
    });
  }
});

// Regular login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Error logging in"
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
        password: "demo123"
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: "Error with demo login"
    });
  }
});

export default router;