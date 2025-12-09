import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sessionManager from "./utils/sessionManager.js";
import { setupSocketHandlers } from "./socket/handlers.js";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// REST API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  const stats = sessionManager.getStats();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeSessions: stats.activeSessions,
    totalUsers: stats.totalUsers,
  });
});

// Create a new session
app.post("/api/sessions/create", (req, res) => {
  try {
    const { language = "javascript" } = req.body;

    // Validate language
    if (!["javascript", "python"].includes(language)) {
      return res.status(400).json({
        error: "Invalid language",
        message: 'Language must be either "javascript" or "python"',
      });
    }

    const session = sessionManager.createSession(language);

    // Generate shareable URL
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const shareUrl = `${frontendUrl}/session/${session.id}`;

    res.status(201).json({
      sessionId: session.id,
      createdAt: new Date(session.createdAt).toISOString(),
      language: session.language,
      shareUrl,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      error: "Failed to create session",
      message: "Internal server error",
    });
  }
});

// Get session details
app.get("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionManager.sessionExists(sessionId)) {
      return res.status(404).json({
        error: "Session not found",
        sessionId,
      });
    }

    const session = sessionManager.getSession(sessionId);
    const userCount = sessionManager.getUserCount(sessionId);

    res.json({
      sessionId: session.id,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString(),
      language: session.language,
      userCount,
      exists: true,
    });
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({
      error: "Failed to get session",
      message: "Internal server error",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Coding Interview Platform - Backend Server           ║
╠════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}            ║
║  Environment: ${process.env.NODE_ENV || "development"}                      ║
║  CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}      ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
