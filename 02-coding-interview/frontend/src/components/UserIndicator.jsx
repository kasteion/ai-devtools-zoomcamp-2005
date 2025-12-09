import { useState } from "react";
import "../styles/UserIndicator.css";

export function UserIndicator({ userCount, users = [] }) {
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="user-indicator">
      <button
        className="user-count-btn"
        onClick={() => setShowUsers(!showUsers)}
        title="Connected users"
      >
        <span className="user-icon">👥</span>
        <span className="user-count">{userCount}</span>
      </button>

      {showUsers && users.length > 0 && (
        <div className="user-list">
          <div className="user-list-header">Connected Users</div>
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <span className="user-status">●</span>
              <span className="user-name">{user.username || "Anonymous"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
