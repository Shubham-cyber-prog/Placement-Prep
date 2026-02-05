import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import homepageRoutes from "./routes/homepageRoutes.js";
import interviewRoutes from "./routes/interview.routes.js"; // Add this import

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan("dev"));

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:8080"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Placement Prep API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/interview", interviewRoutes); // Add this line to register interview routes

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Placement Prep Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      activities: "/api/activities",
      progress: "/api/progress",
      dashboard: "/api/dashboard",
      homepage: "/api/homepage",
      interview: "/api/interview" // Add this endpoint
    },
    documentation: "https://github.com/yourusername/placement-prep-backend"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  console.error("Stack:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err
    })
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/placement-prep";
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log("✅ MongoDB connected successfully");
    
    // Create indexes
    // Note: Remove duplicate index definitions from your models
    // Check your schema files for both "index: true" and schema.index()
    
    console.log("✅ Database indexes created");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    
    // Create HTTP server and Socket.io
    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      },
    });

    // Socket.io setup for real-time discussions
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('joinDiscussion', (discussionId) => {
        socket.join(discussionId);
        console.log(`User ${socket.id} joined discussion ${discussionId}`);
      });

      socket.on('leaveDiscussion', (discussionId) => {
        socket.leave(discussionId);
        console.log(`User ${socket.id} left discussion ${discussionId}`);
      });

      socket.on('newComment', (data) => {
        socket.to(data.discussionId).emit('commentReceived', data);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Home: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`📊 Progress API: http://localhost:${PORT}/api/progress`);
      console.log(`📈 Dashboard API: http://localhost:${PORT}/api/dashboard`);
      console.log(`🏠 Homepage API: http://localhost:${PORT}/api/homepage`);
      console.log(`🎤 Interview API: http://localhost:${PORT}/api/interview`); // Add this line
      console.log(`👤 Demo login: POST http://localhost:${PORT}/api/auth/demo-login`);
      console.log(`📱 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed");
          process.exit(0);
        });
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed");
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
export default app;