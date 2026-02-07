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
import interviewRoutes from "./routes/interview.routes.js";
import groupRoutes from "./routes/group.routes.js"; // Add this import
import discussionRoutes from "./routes/discussion.routes.js"; // Add this import

// Import models to initialize them
import "./models/Group.model.js";
import "./models/Discussion.model.js";
import './models/PracticeProblem.model.js';

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
app.use("/api/interview", interviewRoutes);
app.use("/api/groups", groupRoutes); // Add this line
app.use("/api/discussions", discussionRoutes); // Add this line

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
      interview: "/api/interview",
      groups: "/api/groups", // Add this
      discussions: "/api/discussions" // Add this
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
    
    // Create indexes for groups and discussions
    const Group = mongoose.model('Group');
    const Discussion = mongoose.model('Discussion');
    
    await Group.createIndexes();
    await Discussion.createIndexes();
    
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

    // Socket.io setup for real-time discussions and groups
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Study Group Events
      socket.on('joinGroup', (groupId) => {
        socket.join(`group:${groupId}`);
        console.log(`User ${socket.id} joined group ${groupId}`);
        socket.to(`group:${groupId}`).emit('memberJoined', { userId: socket.id });
      });

      socket.on('leaveGroup', (groupId) => {
        socket.leave(`group:${groupId}`);
        console.log(`User ${socket.id} left group ${groupId}`);
        socket.to(`group:${groupId}`).emit('memberLeft', { userId: socket.id });
      });

      socket.on('groupMessage', (data) => {
        const { groupId, message, userId, userName } = data;
        console.log(`Group ${groupId} message from ${userName}:`, message);
        socket.to(`group:${groupId}`).emit('newGroupMessage', {
          message,
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
      });

      // Discussion Events
      socket.on('joinDiscussion', (discussionId) => {
        socket.join(`discussion:${discussionId}`);
        console.log(`User ${socket.id} joined discussion ${discussionId}`);
      });

      socket.on('leaveDiscussion', (discussionId) => {
        socket.leave(`discussion:${discussionId}`);
        console.log(`User ${socket.id} left discussion ${discussionId}`);
      });

      socket.on('newComment', (data) => {
        const { discussionId, comment, userId, userName } = data;
        console.log(`Discussion ${discussionId} comment from ${userName}:`, comment);
        socket.to(`discussion:${discussionId}`).emit('commentReceived', {
          comment,
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
      });

      // Typing indicators
      socket.on('typingStart', (data) => {
        const { groupId, discussionId, userName } = data;
        if (groupId) {
          socket.to(`group:${groupId}`).emit('userTyping', { userName, isTyping: true });
        } else if (discussionId) {
          socket.to(`discussion:${discussionId}`).emit('userTyping', { userName, isTyping: true });
        }
      });

      socket.on('typingStop', (data) => {
        const { groupId, discussionId, userName } = data;
        if (groupId) {
          socket.to(`group:${groupId}`).emit('userTyping', { userName, isTyping: false });
        } else if (discussionId) {
          socket.to(`discussion:${discussionId}`).emit('userTyping', { userName, isTyping: false });
        }
      });

      // Video/Audio call events for group study sessions
      socket.on('joinStudySession', (sessionId) => {
        socket.join(`session:${sessionId}`);
        socket.to(`session:${sessionId}`).emit('userJoined', { userId: socket.id });
      });

      socket.on('offer', (data) => {
        const { to, offer } = data;
        socket.to(to).emit('offer', { from: socket.id, offer });
      });

      socket.on('answer', (data) => {
        const { to, answer } = data;
        socket.to(to).emit('answer', { from: socket.id, answer });
      });

      socket.on('ice-candidate', (data) => {
        const { to, candidate } = data;
        socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
      });

      socket.on('leaveStudySession', (sessionId) => {
        socket.leave(`session:${sessionId}`);
        socket.to(`session:${sessionId}`).emit('userLeft', { userId: socket.id });
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
      console.log(`🎤 Interview API: http://localhost:${PORT}/api/interview`);
      console.log(`👥 Groups API: http://localhost:${PORT}/api/groups`);
      console.log(`💬 Discussions API: http://localhost:${PORT}/api/discussions`);
      console.log(`👤 Demo login: POST http://localhost:${PORT}/api/auth/demo-login`);
      console.log(`📱 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
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