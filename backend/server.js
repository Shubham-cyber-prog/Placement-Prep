// server.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.get('/', (req, res) => {
    res.send('this is root route..')
})

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/problems", problemRoutes);

// Error handler
app.use(errorHandler);

export default app;
