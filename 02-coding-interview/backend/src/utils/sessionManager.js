import { v4 as uuidv4 } from "uuid";

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT) || 1800000; // 30 minutes
    this.maxSessionDuration =
      parseInt(process.env.MAX_SESSION_DURATION) || 14400000; // 4 hours

    // Clean up inactive sessions every 5 minutes
    setInterval(() => this.cleanupSessions(), 300000);
  }

  createSession(language = "javascript") {
    const sessionId = uuidv4();
    const now = Date.now();

    const session = {
      id: sessionId,
      createdAt: now,
      lastActivity: now,
      code: this.getDefaultCode(language),
      language,
      users: new Map(),
    };

    this.sessions.set(sessionId, session);
    console.log(`Session created: ${sessionId}`);

    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  sessionExists(sessionId) {
    return this.sessions.has(sessionId);
  }

  updateSessionActivity(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  updateSessionCode(sessionId, code) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.code = code;
      session.lastActivity = Date.now();
    }
  }

  updateSessionLanguage(sessionId, language) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.language = language;
      session.code = this.getDefaultCode(language);
      session.lastActivity = Date.now();
    }
  }

  addUser(sessionId, userId, socketId, username = "Anonymous") {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.set(userId, {
        id: userId,
        socketId,
        username,
        joinedAt: Date.now(),
      });
      session.lastActivity = Date.now();
      console.log(`User ${userId} joined session ${sessionId}`);
    }
  }

  removeUser(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.delete(userId);
      session.lastActivity = Date.now();
      console.log(`User ${userId} left session ${sessionId}`);

      // Delete session if no users remain
      if (session.users.size === 0) {
        this.deleteSession(sessionId);
      }
    }
  }

  getUserCount(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.users.size : 0;
  }

  getUsers(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.users.values()).map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }

  deleteSession(sessionId) {
    if (this.sessions.delete(sessionId)) {
      console.log(`Session deleted: ${sessionId}`);
    }
  }

  cleanupSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now - session.lastActivity;
      const totalTime = now - session.createdAt;

      // Delete if inactive for too long or exceeded max duration
      if (
        inactiveTime > this.sessionTimeout ||
        totalTime > this.maxSessionDuration
      ) {
        this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} inactive sessions`);
    }
  }

  getDefaultCode(language) {
    const defaults = {
      javascript: `// Write your JavaScript code here

function solution() {
  // Your code here
  console.log("Hello, World!");
}

solution();`,
      python: `# Write your Python code here

def solution():
    # Your code here
    print("Hello, World!")

solution()`,
    };

    return defaults[language] || defaults.javascript;
  }

  getStats() {
    return {
      activeSessions: this.sessions.size,
      totalUsers: Array.from(this.sessions.values()).reduce(
        (sum, session) => sum + session.users.size,
        0
      ),
    };
  }
}

export default new SessionManager();
