"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(sessionId: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

  socket = io(socketUrl, {
    auth: { sessionId },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
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

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(roomCode: string): void {
  socket?.emit("room:join", { roomCode });
}

export function leaveRoom(roomCode: string): void {
  socket?.emit("room:leave", { roomCode });
}

export function setReady(roomCode: string, isReady: boolean): void {
  socket?.emit("room:ready", { roomCode, isReady });
}

export function startGame(roomCode: string): void {
  socket?.emit("room:start", { roomCode });
}

export function rejoinRoom(roomCode: string, sessionId: string): void {
  socket?.emit("room:rejoin", { roomCode, sessionId });
}
