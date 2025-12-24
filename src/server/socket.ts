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
const caroTurnTimeouts = new Map<string, NodeJS.Timeout>();
const DISCONNECT_TIMEOUT = 30000;
const CARO_TURN_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Room name prefixes to prevent conflicts
const SUDOKU_PREFIX = "sudoku:";
const CARO_PREFIX = "caro:";

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
      const socketRoom = SUDOKU_PREFIX + roomCode;
      
      if (playerSocket.roomCode) {
        playerSocket.leave(playerSocket.roomCode);
        const oldRoom = roomPlayers.get(playerSocket.roomCode);
        oldRoom?.delete(visitorId);
      }

      playerSocket.join(socketRoom);
      playerSocket.roomCode = socketRoom;

      if (!roomPlayers.has(socketRoom)) {
        roomPlayers.set(socketRoom, new Set());
      }
      roomPlayers.get(socketRoom)!.add(visitorId);

      io.to(socketRoom).emit("player_joined", { visitorId, name });
      io.to(socketRoom).emit("room_updated", { 
        roomCode,
        action: "player_joined",
        playerId: visitorId,
        playerName: name,
      });
      console.log(`${name} joined sudoku room ${roomCode}`);
    });

    playerSocket.on("leave_room", (data: { roomCode: string }) => {
      const { roomCode } = data;
      const socketRoom = SUDOKU_PREFIX + roomCode;
      handleLeaveRoom(io, playerSocket, socketRoom);
    });

    playerSocket.on("set_ready", async (data: { roomCode: string; ready: boolean }) => {
      const { roomCode, ready } = data;
      const socketRoom = SUDOKU_PREFIX + roomCode;
      
      try {
        await connectDB();
        const Room = (await import("../models/Room")).default;
        await Room.findOneAndUpdate(
          { code: roomCode, "players.visitorId": visitorId },
          { $set: { "players.$.isReady": ready } }
        );
        console.log(`${name} set ready=${ready} in sudoku room ${roomCode}`);
      } catch (error) {
        console.error("Failed to update ready status:", error);
      }
      
      io.to(socketRoom).emit("player_ready", { visitorId, ready });
    });

    playerSocket.on("start_game", async (data: { roomCode: string }) => {
      const { roomCode } = data;
      const socketRoom = SUDOKU_PREFIX + roomCode;
      
      // Emit countdown
      io.to(socketRoom).emit("game_starting", { countdown: 3 });
      
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
          
          io.to(socketRoom).emit("game_started", {
            puzzle: puzzle.grid,
            solution: puzzle.solution,
            startedAt: room.startedAt,
          });
          
          console.log(`Sudoku game started in room ${roomCode}`);
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
      const socketRoom = SUDOKU_PREFIX + data.roomCode;
      playerSocket.to(socketRoom).emit("cell_update", {
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
      const socketRoom = SUDOKU_PREFIX + data.roomCode;
      io.to(socketRoom).emit("progress_update", {
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
      const socketRoom = SUDOKU_PREFIX + data.roomCode;
      io.to(socketRoom).emit("player_completed", {
        visitorId,
        name,
        time: data.time,
        errors: data.errors,
      });

      if (data.gameEnded) {
        io.to(socketRoom).emit("game_ended", {
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
      const socketRoom = SUDOKU_PREFIX + data.roomCode;
      io.to(socketRoom).emit("player_gave_up", { visitorId, name });

      if (data.gameEnded) {
        io.to(socketRoom).emit("game_ended", {
          winnerId: data.winnerId,
          reason: "all_gave_up",
        });
      }
    });

    playerSocket.on("pause_game", (data: { roomCode: string; paused: boolean }) => {
      const socketRoom = SUDOKU_PREFIX + data.roomCode;
      io.to(socketRoom).emit("game_paused", {
        visitorId,
        name,
        paused: data.paused,
      });
      console.log(`${name} ${data.paused ? "paused" : "resumed"} sudoku game in room ${data.roomCode}`);
    });

    playerSocket.on("ping", () => {
      playerSocket.emit("pong");
    });

    playerSocket.on("reconnect_game", (data: { roomCode: string }) => {
      const { roomCode } = data;
      const socketRoom = SUDOKU_PREFIX + roomCode;
      const existingTimeout = disconnectTimeouts.get(`${socketRoom}_${visitorId}`);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        disconnectTimeouts.delete(`${socketRoom}_${visitorId}`);
      }

      playerSocket.join(socketRoom);
      playerSocket.roomCode = socketRoom;

      if (!roomPlayers.has(socketRoom)) {
        roomPlayers.set(socketRoom, new Set());
      }
      roomPlayers.get(socketRoom)!.add(visitorId);

      io.to(socketRoom).emit("player_reconnected", { visitorId, name });
      console.log(`${name} reconnected to sudoku room ${roomCode}`);
    });

    // Caro game events
    playerSocket.on("caro_join_room", async (data: { roomCode: string }) => {
      const { roomCode } = data;
      const socketRoom = CARO_PREFIX + roomCode;
      
      if (playerSocket.roomCode) {
        playerSocket.leave(playerSocket.roomCode);
        const oldRoom = roomPlayers.get(playerSocket.roomCode);
        oldRoom?.delete(visitorId);
      }

      playerSocket.join(socketRoom);
      playerSocket.roomCode = socketRoom;

      if (!roomPlayers.has(socketRoom)) {
        roomPlayers.set(socketRoom, new Set());
      }
      roomPlayers.get(socketRoom)!.add(visitorId);

      io.to(socketRoom).emit("caro_player_joined", { visitorId, name });
      io.to(socketRoom).emit("caro_room_updated", { 
        roomCode,
        action: "player_joined",
        playerId: visitorId,
        playerName: name,
      });
      console.log(`${name} joined caro room ${roomCode}`);
    });

    playerSocket.on("caro_set_ready", async (data: { roomCode: string; ready: boolean }) => {
      const { roomCode, ready } = data;
      const socketRoom = CARO_PREFIX + roomCode;
      
      try {
        await connectDB();
        const CaroRoom = (await import("../models/CaroRoom")).default;
        await CaroRoom.findOneAndUpdate(
          { code: roomCode, "players.visitorId": visitorId },
          { $set: { "players.$.isReady": ready } }
        );
        console.log(`${name} set ready=${ready} in caro room ${roomCode}`);
      } catch (error) {
        console.error("Failed to update caro ready status:", error);
      }
      
      io.to(socketRoom).emit("caro_player_ready", { visitorId, ready });
    });

    playerSocket.on("caro_start_game", async (data: { roomCode: string }) => {
      const { roomCode } = data;
      const socketRoom = CARO_PREFIX + roomCode;
      
      io.to(socketRoom).emit("caro_game_starting", { countdown: 3 });
      
      setTimeout(async () => {
        try {
          await connectDB();
          const CaroRoom = (await import("../models/CaroRoom")).default;
          
          const room = await CaroRoom.findOne({ code: roomCode });
          if (!room) {
            console.error("Caro room not found for game start");
            return;
          }
          
          io.to(socketRoom).emit("caro_game_started", {
            board: room.board,
            currentTurn: room.currentTurn,
            startedAt: room.startedAt,
            turnStartedAt: room.turnStartedAt,
          });
          
          // Start turn timeout
          startCaroTurnTimeout(io, roomCode);
          
          console.log(`Caro game started in room ${roomCode}`);
        } catch (error) {
          console.error("Error starting caro game:", error);
        }
      }, 3000);
    });

    playerSocket.on("caro_make_move", async (data: {
      roomCode: string;
      row: number;
      col: number;
      symbol: "X" | "O";
    }) => {
      const socketRoom = CARO_PREFIX + data.roomCode;
      
      // Clear existing timeout and start new one
      clearCaroTurnTimeout(data.roomCode);
      
      io.to(socketRoom).emit("caro_move_made", {
        visitorId,
        row: data.row,
        col: data.col,
        symbol: data.symbol,
      });
      
      // Check if game is still playing
      try {
        await connectDB();
        const CaroRoom = (await import("../models/CaroRoom")).default;
        const room = await CaroRoom.findOne({ code: data.roomCode });
        
        if (room && room.status === "playing") {
          startCaroTurnTimeout(io, data.roomCode);
        }
      } catch (error) {
        console.error("Error checking room status:", error);
      }
    });

    playerSocket.on("caro_game_ended", (data: {
      roomCode: string;
      winnerId: string | null;
      isDraw: boolean;
    }) => {
      const socketRoom = CARO_PREFIX + data.roomCode;
      clearCaroTurnTimeout(data.roomCode);
      io.to(socketRoom).emit("caro_game_ended", {
        winnerId: data.winnerId,
        isDraw: data.isDraw,
      });
    });

    playerSocket.on("caro_give_up", (data: { 
      roomCode: string;
      winnerId?: string;
    }) => {
      const socketRoom = CARO_PREFIX + data.roomCode;
      clearCaroTurnTimeout(data.roomCode);
      io.to(socketRoom).emit("caro_player_gave_up", { visitorId, name });

      if (data.winnerId) {
        io.to(socketRoom).emit("caro_game_ended", {
          winnerId: data.winnerId,
          isDraw: false,
        });
      }
    });

    playerSocket.on("caro_pause_game", (data: {
      roomCode: string;
      pausedBy: string;
      pausedByName: string;
      remainingTime: number;
    }) => {
      const socketRoom = CARO_PREFIX + data.roomCode;
      // Dừng turn timeout khi pause
      clearCaroTurnTimeout(data.roomCode);
      
      io.to(socketRoom).emit("caro_game_paused", {
        pausedBy: data.pausedBy,
        pausedByName: data.pausedByName,
        remainingTime: data.remainingTime,
      });
      
      console.log(`Caro game paused in room ${data.roomCode} by ${data.pausedByName}`);
    });

    playerSocket.on("caro_resume_game", async (data: {
      roomCode: string;
      turnStartedAt: string;
    }) => {
      const socketRoom = CARO_PREFIX + data.roomCode;
      
      io.to(socketRoom).emit("caro_game_resumed", {
        turnStartedAt: data.turnStartedAt,
      });
      
      // Khởi động lại turn timeout
      try {
        await connectDB();
        const CaroRoom = (await import("../models/CaroRoom")).default;
        const room = await CaroRoom.findOne({ code: data.roomCode });
        
        if (room && room.status === "playing") {
          startCaroTurnTimeout(io, data.roomCode);
        }
      } catch (error) {
        console.error("Error restarting turn timeout:", error);
      }
      
      console.log(`Caro game resumed in room ${data.roomCode}`);
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

function startCaroTurnTimeout(io: Server, roomCode: string): void {
  clearCaroTurnTimeout(roomCode);
  
  const timeoutId = setTimeout(async () => {
    try {
      await connectDB();
      const CaroRoom = (await import("../models/CaroRoom")).default;
      
      const room = await CaroRoom.findOne({ code: roomCode });
      if (!room || room.status !== "playing") {
        return;
      }
      
      // Find current player and opponent
      const currentPlayer = room.players.find((p: { symbol: string }) => p.symbol === room.currentTurn);
      const opponent = room.players.find((p: { symbol: string }) => p.symbol !== room.currentTurn);
      
      // Current player loses due to timeout
      room.status = "finished";
      room.winnerId = opponent?.visitorId || null;
      room.finishedAt = new Date();
      await room.save();
      
      const socketRoom = CARO_PREFIX + roomCode;
      io.to(socketRoom).emit("caro_turn_timeout", {
        timedOutPlayer: currentPlayer?.visitorId,
        winnerId: room.winnerId,
      });
      
      io.to(socketRoom).emit("caro_game_ended", {
        winnerId: room.winnerId,
        isDraw: false,
        reason: "timeout",
      });
      
      console.log(`Caro turn timeout in room ${roomCode}, winner: ${room.winnerId}`);
    } catch (error) {
      console.error("Error handling caro turn timeout:", error);
    } finally {
      caroTurnTimeouts.delete(roomCode);
    }
  }, CARO_TURN_TIMEOUT);
  
  caroTurnTimeouts.set(roomCode, timeoutId);
}

function clearCaroTurnTimeout(roomCode: string): void {
  const timeoutId = caroTurnTimeouts.get(roomCode);
  if (timeoutId) {
    clearTimeout(timeoutId);
    caroTurnTimeouts.delete(roomCode);
  }
}
