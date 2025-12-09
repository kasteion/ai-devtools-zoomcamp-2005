import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

let socketInstance = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize socket connection only once
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Connection event handlers
      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance.id);
        setIsConnected(true);
        setError(null);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(err.message);
        setIsConnected(false);
      });

      socketInstance.on("error", (err) => {
        console.error("Socket error:", err);
        setError(err.message);
      });
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on component unmount, only when app closes
      // This allows socket to persist across component re-renders
    };
  }, []);

  return {
    socket: socketInstance,
    isConnected,
    error,
  };
}
