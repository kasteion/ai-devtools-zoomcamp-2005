import { useState } from "react";
import "../styles/SessionCreator.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function SessionCreator({ onSessionCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  async function createSession() {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/sessions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: "javascript" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      onSessionCreated(data.sessionId);
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="session-creator">
      <div className="creator-content">
        <h1>Online Coding Interview</h1>
        <p>
          Create a collaborative coding session and share it with candidates
        </p>

        <button
          onClick={createSession}
          disabled={isCreating}
          className="create-btn"
        >
          {isCreating ? "Creating..." : "Create New Session"}
        </button>

        {error && <div className="error-message">Error: {error}</div>}

        <div className="features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Real-time collaboration</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💻</span>
            <span>JavaScript & Python support</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span>Safe browser execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
