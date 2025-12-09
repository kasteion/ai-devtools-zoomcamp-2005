import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { CodeEditor } from "./components/CodeEditor";
import { LanguageSelector } from "./components/LanguageSelector";
import { OutputPanel } from "./components/OutputPanel";
import { UserIndicator } from "./components/UserIndicator";
import { SessionCreator } from "./components/SessionCreator";
import { useSocket } from "./hooks/useSocket";
import { useCodeExecution } from "./hooks/useCodeExecution";
import { DEFAULT_CODE, LANGUAGES } from "./constants/languages";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [userId] = useState(() => uuidv4());
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState(LANGUAGES.JAVASCRIPT);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const { socket, isConnected } = useSocket();
  const { executeCode, isExecuting, output, error, clearOutput } =
    useCodeExecution();

  const isUpdatingFromSocketRef = useRef(false);
  const debounceTimerRef = useRef(null);

  // Check URL for session ID on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/session\/([a-f0-9-]+)/);
    if (match) {
      setSessionId(match[1]);
    }
  }, []);

  // Join session when sessionId and socket are available
  useEffect(() => {
    if (sessionId && socket && isConnected) {
      console.log("Joining session:", sessionId);
      socket.emit("join-session", {
        sessionId,
        userId,
        username: "User",
      });

      // Generate share link
      const link = `${window.location.origin}/session/${sessionId}`;
      setShareLink(link);
    }
  }, [sessionId, socket, isConnected, userId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on("session-joined", (data) => {
      console.log("Session joined:", data);
      isUpdatingFromSocketRef.current = true;
      setCode(data.currentCode);
      setLanguage(data.language);
      setUsers(data.users);
      setUserCount(data.userCount);
      isUpdatingFromSocketRef.current = false;
    });

    socket.on("code-update", (data) => {
      if (data.userId !== userId) {
        isUpdatingFromSocketRef.current = true;
        setCode(data.code);
        isUpdatingFromSocketRef.current = false;
      }
    });

    socket.on("language-update", (data) => {
      if (data.userId !== userId) {
        isUpdatingFromSocketRef.current = true;
        setLanguage(data.language);
        setCode(data.code);
        isUpdatingFromSocketRef.current = false;
      }
    });

    socket.on("user-joined", (data) => {
      console.log("User joined:", data);
      setUserCount(data.userCount);
    });

    socket.on("user-left", (data) => {
      console.log("User left:", data);
      setUserCount(data.userCount);
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data);
      alert(`Error: ${data.message}`);
    });

    return () => {
      socket.off("session-joined");
      socket.off("code-update");
      socket.off("language-update");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("error");
    };
  }, [socket, userId]);

  // Handle code changes with debouncing
  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode);

      if (!isUpdatingFromSocketRef.current && socket && sessionId) {
        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Debounce socket emission
        debounceTimerRef.current = setTimeout(() => {
          socket.emit("code-change", {
            sessionId,
            code: newCode,
            userId,
          });
        }, 300);
      }
    },
    [socket, sessionId, userId]
  );

  // Handle language change
  const handleLanguageChange = useCallback(
    (newLanguage) => {
      if (socket && sessionId) {
        socket.emit("language-change", {
          sessionId,
          language: newLanguage,
          userId,
        });
      }
    },
    [socket, sessionId, userId]
  );

  // Handle code execution
  const handleRunCode = useCallback(async () => {
    await executeCode(code, language);
  }, [code, language, executeCode]);

  // Handle session creation
  const handleSessionCreated = useCallback((newSessionId) => {
    setSessionId(newSessionId);
    window.history.pushState({}, "", `/session/${newSessionId}`);
  }, []);

  // Copy share link
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareLink]);

  // Show session creator if no session
  if (!sessionId) {
    return <SessionCreator onSessionCreated={handleSessionCreated} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Coding Interview</h1>
          <div className="session-info">
            <span className="session-label">Session:</span>
            <code className="session-id">{sessionId.slice(0, 8)}...</code>
          </div>
        </div>
        <div className="header-right">
          <div className="share-link">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="share-input"
            />
            <button onClick={handleCopyLink} className="copy-btn">
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
          <UserIndicator userCount={userCount} users={users} />
          <div
            className={`connection-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            {isConnected ? "● Connected" : "○ Disconnected"}
          </div>
        </div>
      </header>

      <div className="toolbar">
        <LanguageSelector
          language={language}
          onChange={handleLanguageChange}
          disabled={isExecuting}
        />
        <button
          onClick={handleRunCode}
          disabled={isExecuting || !isConnected}
          className="run-btn"
        >
          {isExecuting ? "⏳ Running..." : "▶ Run Code"}
        </button>
      </div>

      <div className="main-content">
        <div className="editor-section">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            readOnly={!isConnected}
          />
        </div>
        <div className="output-section">
          <OutputPanel
            output={output}
            error={error}
            isExecuting={isExecuting}
            onClear={clearOutput}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
