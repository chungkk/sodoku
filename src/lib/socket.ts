"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export interface SocketAuth {
  visitorId: string;
  name: string;
}

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(auth: SocketAuth): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io({
    path: "/api/socketio",
    auth,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emitEvent<T>(event: string, data: T): void {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn("Socket not connected, cannot emit:", event);
  }
}

export function onEvent<T>(event: string, callback: (data: T) => void): void {
  socket?.on(event, callback);
}

export function offEvent(event: string): void {
  socket?.off(event);
}
