# Multi-stage build for coding interview platform
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./public

# Create a simple static file server configuration
# The backend will serve the frontend files
RUN echo 'import express from "express";\n\
import { fileURLToPath } from "url";\n\
import { dirname, join } from "path";\n\
import { createServer } from "http";\n\
import { Server } from "socket.io";\n\
import cors from "cors";\n\
import dotenv from "dotenv";\n\
import sessionManager from "./src/utils/sessionManager.js";\n\
import { setupSocketHandlers } from "./src/socket/handlers.js";\n\
\n\
dotenv.config();\n\
\n\
const __filename = fileURLToPath(import.meta.url);\n\
const __dirname = dirname(__filename);\n\
\n\
const app = express();\n\
const httpServer = createServer(app);\n\
\n\
const io = new Server(httpServer, {\n\
  cors: {\n\
    origin: process.env.CORS_ORIGIN || "*",\n\
    methods: ["GET", "POST"],\n\
    credentials: true\n\
  },\n\
  transports: ["websocket", "polling"]\n\
});\n\
\n\
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));\n\
app.use(express.json());\n\
\n\
// API Routes\n\
app.get("/api/health", (req, res) => {\n\
  const stats = sessionManager.getStats();\n\
  res.json({\n\
    status: "ok",\n\
    timestamp: new Date().toISOString(),\n\
    uptime: process.uptime(),\n\
    activeSessions: stats.activeSessions,\n\
    totalUsers: stats.totalUsers\n\
  });\n\
});\n\
\n\
app.post("/api/sessions/create", (req, res) => {\n\
  try {\n\
    const { language = "javascript" } = req.body;\n\
    if (!["javascript", "python"].includes(language)) {\n\
      return res.status(400).json({ error: "Invalid language" });\n\
    }\n\
    const session = sessionManager.createSession(language);\n\
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;\n\
    const shareUrl = `${baseUrl}/session/${session.id}`;\n\
    res.status(201).json({\n\
      sessionId: session.id,\n\
      createdAt: new Date(session.createdAt).toISOString(),\n\
      language: session.language,\n\
      shareUrl\n\
    });\n\
  } catch (error) {\n\
    console.error("Error creating session:", error);\n\
    res.status(500).json({ error: "Failed to create session" });\n\
  }\n\
});\n\
\n\
app.get("/api/sessions/:sessionId", (req, res) => {\n\
  try {\n\
    const { sessionId } = req.params;\n\
    if (!sessionManager.sessionExists(sessionId)) {\n\
      return res.status(404).json({ error: "Session not found", sessionId });\n\
    }\n\
    const session = sessionManager.getSession(sessionId);\n\
    const userCount = sessionManager.getUserCount(sessionId);\n\
    res.json({\n\
      sessionId: session.id,\n\
      createdAt: new Date(session.createdAt).toISOString(),\n\
      lastActivity: new Date(session.lastActivity).toISOString(),\n\
      language: session.language,\n\
      userCount,\n\
      exists: true\n\
    });\n\
  } catch (error) {\n\
    console.error("Error getting session:", error);\n\
    res.status(500).json({ error: "Failed to get session" });\n\
  }\n\
});\n\
\n\
// Serve static frontend files\n\
app.use(express.static(join(__dirname, "public")));\n\
\n\
// SPA fallback - serve index.html for all other routes\n\
app.get("*", (req, res) => {\n\
  res.sendFile(join(__dirname, "public", "index.html"));\n\
});\n\
\n\
setupSocketHandlers(io);\n\
\n\
const PORT = process.env.PORT || 3001;\n\
httpServer.listen(PORT, "0.0.0.0", () => {\n\
  console.log(`Server running on port ${PORT}`);\n\
});\n\
\n\
process.on("SIGTERM", () => {\n\
  httpServer.close(() => process.exit(0));\n\
});\n\
process.on("SIGINT", () => {\n\
  httpServer.close(() => process.exit(0));\n\
});' > server-production.js

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server-production.js"]