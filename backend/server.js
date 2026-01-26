import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Simple rate limiting
const rateLimit = {};
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 100;

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 1, startTime: now };
  } else {
    if (now - rateLimit[ip].startTime > windowMs) {
      rateLimit[ip] = { count: 1, startTime: now };
    } else {
      rateLimit[ip].count++;
    }
  }

  if (rateLimit[ip].count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later."
    });
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

// Simple test routes (remove imports for now)
app.get("/api/questions", (req, res) => {
  res.json({
    success: true,
    questions: [
      { id: 1, question: "Explain closure in JavaScript", difficulty: "Medium" },
      { id: 2, question: "What is React virtual DOM?", difficulty: "Easy" }
    ]
  });
});

app.get("/api/mock-tests", (req, res) => {
  res.json({
    success: true,
    tests: [
      { id: 1, name: "FAANG Mock Test", difficulty: "Hard" },
      { id: 2, name: "DSA Basics", difficulty: "Medium" }
    ]
  });
});

// Database connection (optional - you can start without DB first)
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
} else {
  console.log('⚠️  MONGODB_URI not set, running without database');
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Questions: http://localhost:${PORT}/api/questions`);
  console.log(`🧪 Mock Tests: http://localhost:${PORT}/api/mock-tests`);
});

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