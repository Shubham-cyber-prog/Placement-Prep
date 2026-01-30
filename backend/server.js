import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import progressRoutes from "./routes/progressRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import homepageRoutes from "./routes/homepageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"; // NEW IMPORT

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
const rateLimit = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, startTime: now });
  } else {
    const userData = rateLimit.get(ip);
    
    if (now - userData.startTime > WINDOW_MS) {
      rateLimit.set(ip, { count: 1, startTime: now });
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
        demoLogin: "POST /api/auth/demo-login",
        me: "GET /api/auth/me"
      },
      progress: {
        getProgress: "GET /api/progress",
        recordTest: "POST /api/progress/test",
        updateSkill: "PUT /api/progress/skill",
        analytics: "GET /api/progress/analytics"
      },
      dashboard: { // NEW ENDPOINTS
        getDashboard: "GET /api/dashboard",
        recordActivity: "POST /api/dashboard/activity",
        platformStats: "GET /api/dashboard/platform-stats",
        preferences: "PUT /api/dashboard/preferences"
      },
      homepage: {
        stats: "GET /api/homepage/stats",
        leaderboard: "GET /api/homepage/leaderboard",
        mentorship: {
          requests: "GET /api/homepage/mentorship/requests",
          request: "POST /api/homepage/mentorship/request",
          mentors: "GET /api/homepage/mentorship/mentors"
        }
      },
      health: "GET /api/health"
    }
  });
});

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/progress", progressRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/dashboard", dashboardRoutes); // NEW ROUTE

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/placement-prep";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Create initial leaderboard if not exists
    initializeLeaderboard();
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
  console.log(`📈 Dashboard API: http://localhost:${PORT}/api/dashboard`); // NEW LOG
  console.log(`🏠 Homepage API: http://localhost:${PORT}/api/homepage`);
  console.log(`👤 Demo login: POST http://localhost:${PORT}/api/auth/demo-login`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`\n🎮 Quick Start:`);
  console.log(`1. Run demo login: POST http://localhost:${PORT}/api/auth/demo-login`);
  console.log(`2. Use the token to access: GET http://localhost:${PORT}/api/progress`);
  console.log(`3. Record test: POST http://localhost:${PORT}/api/progress/test`);
  console.log(`4. Get dashboard: GET http://localhost:${PORT}/api/dashboard`);
});

// Helper function to initialize leaderboard
async function initializeLeaderboard() {
  try {
    const Leaderboard = mongoose.model('Leaderboard');
    const existing = await Leaderboard.findOne({ period: 'weekly', isActive: true });
    
    if (!existing) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      await Leaderboard.create({
        period: 'weekly',
        startDate,
        endDate,
        isActive: true,
        rankings: [],
        totalParticipants: 0
      });
      console.log('✅ Weekly leaderboard initialized');
    }
  } catch (error) {
    console.error('Error initializing leaderboard:', error);
  }
}

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;