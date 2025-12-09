import sessionManager from "../utils/sessionManager.js";

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle joining a session
    socket.on("join-session", ({ sessionId, userId, username }) => {
      try {
        // Validate session exists
        if (!sessionManager.sessionExists(sessionId)) {
          socket.emit("error", {
            message: "Session not found",
            code: "SESSION_NOT_FOUND",
          });
          return;
        }

        // Join the Socket.IO room
        socket.join(sessionId);

        // Add user to session
        sessionManager.addUser(sessionId, userId, socket.id, username);

        // Get current session state
        const session = sessionManager.getSession(sessionId);
        const users = sessionManager.getUsers(sessionId);
        const userCount = sessionManager.getUserCount(sessionId);

        // Send current state to the joining user
        socket.emit("session-joined", {
          sessionId,
          currentCode: session.code,
          language: session.language,
          users,
          userCount,
        });

        // Notify other users in the room
        socket.to(sessionId).emit("user-joined", {
          userId,
          username,
          userCount,
        });

        console.log(`User ${userId} joined session ${sessionId}`);
      } catch (error) {
        console.error("Error joining session:", error);
        socket.emit("error", {
          message: "Failed to join session",
          code: "CONNECTION_ERROR",
        });
      }
    });

    // Handle code changes
    socket.on("code-change", ({ sessionId, code, userId }) => {
      try {
        if (!sessionManager.sessionExists(sessionId)) {
          socket.emit("error", {
            message: "Session not found",
            code: "SESSION_NOT_FOUND",
          });
          return;
        }

        // Update session code
        sessionManager.updateSessionCode(sessionId, code);

        // Broadcast to all other users in the room
        socket.to(sessionId).emit("code-update", {
          code,
          userId,
          timestamp: Date.now(),
        });

        console.log(`Code updated in session ${sessionId} by user ${userId}`);
      } catch (error) {
        console.error("Error updating code:", error);
        socket.emit("error", {
          message: "Failed to update code",
          code: "UPDATE_ERROR",
        });
      }
    });

    // Handle language changes
    socket.on("language-change", ({ sessionId, language, userId }) => {
      try {
        if (!sessionManager.sessionExists(sessionId)) {
          socket.emit("error", {
            message: "Session not found",
            code: "SESSION_NOT_FOUND",
          });
          return;
        }

        // Update session language and reset code
        sessionManager.updateSessionLanguage(sessionId, language);
        const session = sessionManager.getSession(sessionId);

        // Broadcast to all users in the room (including sender)
        io.to(sessionId).emit("language-update", {
          language,
          code: session.code,
          userId,
        });

        console.log(`Language changed to ${language} in session ${sessionId}`);
      } catch (error) {
        console.error("Error changing language:", error);
        socket.emit("error", {
          message: "Failed to change language",
          code: "UPDATE_ERROR",
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Find and remove user from all sessions
      for (const [sessionId, session] of sessionManager.sessions.entries()) {
        for (const [userId, user] of session.users.entries()) {
          if (user.socketId === socket.id) {
            sessionManager.removeUser(sessionId, userId);

            const userCount = sessionManager.getUserCount(sessionId);

            // Notify remaining users
            socket.to(sessionId).emit("user-left", {
              userId,
              userCount,
            });

            console.log(
              `User ${userId} disconnected from session ${sessionId}`
            );
            break;
          }
        }
      }
    });
  });
}
