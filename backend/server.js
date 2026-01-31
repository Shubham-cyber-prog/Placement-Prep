import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import progressRoutes from "./routes/progressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profile.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting middleware
const rateLimitMap = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    const userData = rateLimitMap.get(ip);
    
    if (now - userData.startTime > WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
    } else {
      userData.count++;
      if (userData.count > MAX_REQUESTS) {
        return res.status(429).json({
          success: false,
          message: "Too many requests, please try again later."
        });
      }
    }
  }

  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Placement Prep Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Placement Prep Backend API",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        demoLogin: "POST /api/auth/demo-login"
      },
      progress: {
        getProgress: "GET /api/progress",
        recordTest: "POST /api/progress/test",
        updateSkill: "PUT /api/progress/skill",
        analytics: "GET /api/progress/analytics"
      },
      profile: "GET /api/profile",
      topics: "GET /api/topics",
      problems: "GET /api/problems",
      rankings: "GET /api/rankings",
      health: "GET /api/health"
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/rankings", rankingRoutes);
app.use("/api/progress", progressRoutes);

// Mock tests endpoint
app.get("/api/mock-tests", (req, res) => {
  res.json({
    success: true,
    tests: [
      { id: 1, name: "FAANG Mock Test", difficulty: "Hard" },
      { id: 2, name: "DSA Basics", difficulty: "Medium" }
    ]
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/placement-prep";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Home: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Progress API: http://localhost:${PORT}/api/progress`);
  console.log(`👤 Demo login: POST http://localhost:${PORT}/api/auth/demo-login`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

export default app;