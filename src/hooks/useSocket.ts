"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  visitorId: string;
  name: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(event: string, data: T) => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: (event: string) => void;
}

export function useSocket({
  visitorId,
  name,
  autoConnect = true,
}: UseSocketOptions): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    const isExternalSocket = socketUrl && !socketUrl.includes("localhost:3000");
    
    socketRef.current = io(socketUrl, {
      // Only use custom path for local dev (same origin)
      ...(isExternalSocket ? {} : { path: "/api/socketio" }),
      auth: { visitorId, name },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    socketRef.current.on("error", (data: { code: string; message: string }) => {
      setError(data.message);
    });
  }, [visitorId, name]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback(<T,>(event: string, data: T) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  useEffect(() => {
    if (autoConnect && visitorId && name) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, visitorId, name, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
