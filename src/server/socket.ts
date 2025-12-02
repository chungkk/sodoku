import { Server, Socket } from "socket.io";
import connectDB from "../lib/mongodb";

interface SocketAuth {
  visitorId: string;
  name: string;
}

interface PlayerSocket extends Socket {
  auth: SocketAuth;
  roomCode?: string;
}

const playerSockets = new Map<string, PlayerSocket>();
const roomPlayers = new Map<string, Set<string>>();
const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
const DISCONNECT_TIMEOUT = 30000;

export function setupSocketHandlers(io: Server): void {
  io.use((socket: Socket, next) => {
    const auth = socket.handshake.auth as SocketAuth;
    if (!auth?.visitorId || !auth?.name) {
      return next(new Error("Authentication required"));
    }
    (socket as PlayerSocket).auth = auth;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const playerSocket = socket as PlayerSocket;
    const { visitorId, name } = playerSocket.auth;

    console.log(`Player connected: ${name} (${visitorId})`);
    playerSockets.set(visitorId, playerSocket);

    playerSocket.on("join_room", async (data: { roomCode: string }) => {
      const { roomCode } = data;
      
      if (playerSocket.roomCode) {
        playerSocket.leave(playerSocket.roomCode);
        const oldRoom = roomPlayers.get(playerSocket.roomCode);
        oldRoom?.delete(visitorId);
      }

      playerSocket.join(roomCode);
      playerSocket.roomCode = roomCode;

      if (!roomPlayers.has(roomCode)) {
        roomPlayers.set(roomCode, new Set());
      }
      roomPlayers.get(roomCode)!.add(visitorId);

      io.to(roomCode).emit("player_joined", { visitorId, name });
      io.to(roomCode).emit("room_updated", { 
        roomCode,
        action: "player_joined",
        playerId: visitorId,
        playerName: name,
      });
      console.log(`${name} joined room ${roomCode}`);
    });

    playerSocket.on("leave_room", (data: { roomCode: string }) => {
      const { roomCode } = data;
      handleLeaveRoom(io, playerSocket, roomCode);
    });

    playerSocket.on("set_ready", async (data: { roomCode: string; ready: boolean }) => {
      const { roomCode, ready } = data;
      
      try {
        await connectDB();
        const Room = (await import("../models/Room")).default;
        await Room.findOneAndUpdate(
          { code: roomCode, "players.visitorId": visitorId },
          { $set: { "players.$.isReady": ready } }
        );
        console.log(`${name} set ready=${ready} in room ${roomCode}`);
      } catch (error) {
        console.error("Failed to update ready status:", error);
      }
      
      io.to(roomCode).emit("player_ready", { visitorId, ready });
    });

    playerSocket.on("start_game", async (data: { roomCode: string }) => {
      const { roomCode } = data;
      
      // Emit countdown
      io.to(roomCode).emit("game_starting", { countdown: 3 });
      
      // Wait for countdown then emit game_started
      setTimeout(async () => {
        try {
          await connectDB();
          const Room = (await import("../models/Room")).default;
          const Puzzle = (await import("../models/Puzzle")).default;
          
          const room = await Room.findOne({ code: roomCode });
          if (!room || !room.puzzleId) {
            console.error("Room or puzzle not found for game start");
            return;
          }
          
          const puzzle = await Puzzle.findById(room.puzzleId);
          if (!puzzle) {
            console.error("Puzzle not found");
            return;
          }
          
          io.to(roomCode).emit("game_started", {
            puzzle: puzzle.grid,
            solution: puzzle.solution,
            startedAt: room.startedAt,
          });
          
          console.log(`Game started in room ${roomCode}`);
        } catch (error) {
          console.error("Error starting game:", error);
        }
      }, 3000);
    });

    playerSocket.on("cell_update", (data: {
      roomCode: string;
      row: number;
      col: number;
      value: number | null;
      valid?: boolean;
      conflicts?: { row: number; col: number }[];
    }) => {
      playerSocket.to(data.roomCode).emit("cell_update", {
        visitorId,
        row: data.row,
        col: data.col,
        value: data.value,
      });

      if (data.valid === false && data.conflicts) {
        playerSocket.emit("cell_validated", {
          row: data.row,
          col: data.col,
          valid: false,
          conflicts: data.conflicts,
        });
      }
    });

    playerSocket.on("progress_update", (data: {
      roomCode: string;
      progress: number;
      errors: number;
    }) => {
      io.to(data.roomCode).emit("progress_update", {
        visitorId,
        name,
        progress: data.progress,
        errors: data.errors,
      });
    });

    playerSocket.on("complete_puzzle", (data: {
      roomCode: string;
      grid: number[][];
      time: number;
      errors: number;
      gameEnded?: boolean;
      winnerId?: string;
    }) => {
      io.to(data.roomCode).emit("player_completed", {
        visitorId,
        name,
        time: data.time,
        errors: data.errors,
      });

      if (data.gameEnded) {
        io.to(data.roomCode).emit("game_ended", {
          winnerId: data.winnerId,
          reason: "completed",
        });
      }
    });

    playerSocket.on("give_up", (data: { 
      roomCode: string;
      gameEnded?: boolean;
      winnerId?: string;
    }) => {
      io.to(data.roomCode).emit("player_gave_up", { visitorId, name });

      if (data.gameEnded) {
        io.to(data.roomCode).emit("game_ended", {
          winnerId: data.winnerId,
          reason: "all_gave_up",
        });
      }
    });

    playerSocket.on("ping", () => {
      playerSocket.emit("pong");
    });

    playerSocket.on("reconnect_game", (data: { roomCode: string }) => {
      const { roomCode } = data;
      const existingTimeout = disconnectTimeouts.get(`${roomCode}_${visitorId}`);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        disconnectTimeouts.delete(`${roomCode}_${visitorId}`);
      }

      playerSocket.join(roomCode);
      playerSocket.roomCode = roomCode;

      if (!roomPlayers.has(roomCode)) {
        roomPlayers.set(roomCode, new Set());
      }
      roomPlayers.get(roomCode)!.add(visitorId);

      io.to(roomCode).emit("player_reconnected", { visitorId, name });
      console.log(`${name} reconnected to room ${roomCode}`);
    });

    playerSocket.on("disconnect", (reason) => {
      console.log(`Player disconnected: ${name} (${visitorId}) - ${reason}`);
      playerSockets.delete(visitorId);

      if (playerSocket.roomCode) {
        const roomCode = playerSocket.roomCode;
        
        io.to(roomCode).emit("player_disconnected", {
          visitorId,
          name,
          timeout: DISCONNECT_TIMEOUT / 1000,
        });

        const timeoutId = setTimeout(() => {
          handleLeaveRoom(io, playerSocket, roomCode, true);
          disconnectTimeouts.delete(`${roomCode}_${visitorId}`);
          
          io.to(roomCode).emit("player_timeout", {
            visitorId,
            name,
          });
        }, DISCONNECT_TIMEOUT);

        disconnectTimeouts.set(`${roomCode}_${visitorId}`, timeoutId);
      }
    });
  });
}

function handleLeaveRoom(
  io: Server,
  playerSocket: PlayerSocket,
  roomCode: string,
  disconnected = false
): void {
  const { visitorId, name } = playerSocket.auth;

  playerSocket.leave(roomCode);
  const room = roomPlayers.get(roomCode);
  room?.delete(visitorId);

  if (room?.size === 0) {
    roomPlayers.delete(roomCode);
  }

  if (playerSocket.roomCode === roomCode) {
    playerSocket.roomCode = undefined;
  }

  io.to(roomCode).emit("player_left", {
    visitorId,
    name,
    disconnected,
  });

  console.log(`${name} left room ${roomCode}${disconnected ? " (disconnected)" : ""}`);
}

export function getConnectedPlayers(): number {
  return playerSockets.size;
}

export function getRoomCount(): number {
  return roomPlayers.size;
}
