import express from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import groupRoutes from "./routes/group.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for testing
  message: {
    success: false,
    message: "Too many requests, please try again later."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/rankings", rankingRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/sessions", sessionRoutes);
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

// Create HTTP server and Socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Socket.io setup for real-time discussions and collaborative coding
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Discussion events
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

  // Collaborative coding session events
  socket.on('joinSession', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined coding session ${roomId}`);
    socket.to(roomId).emit('userJoined', { userId: socket.id });
  });

  socket.on('leaveSession', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left coding session ${roomId}`);
    socket.to(roomId).emit('userLeft', { userId: socket.id });
  });

  socket.on('codeChange', (data) => {
    socket.to(data.roomId).emit('codeUpdate', { code: data.code, userId: socket.id });
  });

  socket.on('cursorMove', (data) => {
    socket.to(data.roomId).emit('cursorUpdate', { position: data.position, userId: socket.id });
  });

  socket.on('sendMessage', (data) => {
    socket.to(data.roomId).emit('messageReceived', { message: data.message, userId: socket.id, timestamp: new Date() });
  });

  // WebRTC signaling for video/audio
  socket.on('webrtcOffer', (data) => {
    socket.to(data.roomId).emit('webrtcOffer', { offer: data.offer, from: socket.id });
  });

  socket.on('webrtcAnswer', (data) => {
    socket.to(data.roomId).emit('webrtcAnswer', { answer: data.answer, from: socket.id });
  });

  socket.on('webrtcIceCandidate', (data) => {
    socket.to(data.roomId).emit('webrtcIceCandidate', { candidate: data.candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
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
app.use(errorHandler);

export default app;