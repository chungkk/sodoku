import { Server, Socket } from "socket.io";
import CaroRoom from "../models/CaroRoom";
import Puzzle from "../models/Puzzle";
import Room from "../models/Room";
import { isValidPlayerToken } from "../lib/player-token";
import { caroSocketRoom, setRealtime, sudokuSocketRoom } from "../lib/realtime";

interface SocketAuth {
  visitorId: string;
  name: string;
  token?: string;
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

/** Mã phòng trong dữ liệu client gửi lên; payload sai dạng thì trả về null thay vì làm sập server. */
function codeOf(data: unknown): string | null {
  const code = (data as { roomCode?: unknown } | null | undefined)?.roomCode;
  return typeof code === "string" && code ? code.toUpperCase() : null;
}

export function setupSocketHandlers(io: Server): void {
  setRealtime({
    emit: (socketRoom, event, data) => {
      io.to(socketRoom).emit(event, data);
    },
    caroTurnStarted: (roomCode) => startCaroTurnTimeout(io, roomCode),
    caroTurnEnded: clearCaroTurnTimeout,
  });

  io.use((socket: Socket, next) => {
    const auth = socket.handshake.auth as SocketAuth;
    if (!auth?.name || !isValidPlayerToken(auth.visitorId, auth.token)) {
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

    /** Người chơi của phòng Sudoku này, null nếu socket không thuộc phòng. */
    const sudokuMember = (roomCode: string) => {
      const room = Room.findByCode(roomCode);
      const player = room?.players.find((p) => p.visitorId === visitorId);
      return room && player ? { room, player } : null;
    };

    const caroMember = (roomCode: string) => {
      const room = CaroRoom.findByCode(roomCode);
      const player = room?.players.find((p) => p.visitorId === visitorId);
      return room && player ? { room, player } : null;
    };

    const enterSocketRoom = (socketRoom: string) => {
      if (playerSocket.roomCode && playerSocket.roomCode !== socketRoom) {
        playerSocket.leave(playerSocket.roomCode);
        roomPlayers.get(playerSocket.roomCode)?.delete(visitorId);
      }

      playerSocket.join(socketRoom);
      playerSocket.roomCode = socketRoom;

      if (!roomPlayers.has(socketRoom)) {
        roomPlayers.set(socketRoom, new Set());
      }
      roomPlayers.get(socketRoom)!.add(visitorId);
    };

    playerSocket.on("join_room", (data: { roomCode: string }) => {
      const roomCode = codeOf(data);
      if (!roomCode) return;
      const socketRoom = sudokuSocketRoom(roomCode);

      // Ai cũng theo dõi được (GET phòng vốn công khai), nhưng chỉ người trong phòng mới được báo "đã vào"
      enterSocketRoom(socketRoom);

      const member = sudokuMember(roomCode);
      if (!member) return;

      const memberName = member.player.name;
      io.to(socketRoom).emit("player_joined", { visitorId, name: memberName });
      io.to(socketRoom).emit("room_updated", {
        roomCode,
        action: "player_joined",
        playerId: visitorId,
        playerName: memberName,
      });
      console.log(`${memberName} joined sudoku room ${roomCode}`);
    });

    playerSocket.on("leave_room", (data: { roomCode: string }) => {
      const roomCode = codeOf(data);
      if (roomCode) handleLeaveRoom(io, playerSocket, sudokuSocketRoom(roomCode));
    });

    playerSocket.on("set_ready", (data: { roomCode: string; ready: boolean }) => {
      const roomCode = codeOf(data);
      if (!roomCode || !sudokuMember(roomCode)) return;

      const ready = data.ready === true;
      try {
        Room.updatePlayerReady(roomCode, visitorId, ready);
      } catch (error) {
        console.error("Failed to update ready status:", error);
      }

      io.to(sudokuSocketRoom(roomCode)).emit("player_ready", { visitorId, ready });
    });

    playerSocket.on("start_game", (data: { roomCode: string }) => {
      const roomCode = codeOf(data);
      if (!roomCode) return;

      // Ván đã được bắt đầu qua API (có kiểm tra chủ phòng); sự kiện này chỉ chạy đếm ngược
      const member = sudokuMember(roomCode);
      if (!member || member.room.hostId !== visitorId || member.room.status !== "playing") return;

      const socketRoom = sudokuSocketRoom(roomCode);
      io.to(socketRoom).emit("game_starting", { countdown: 3 });

      setTimeout(() => {
        try {
          const room = Room.findByCode(roomCode);
          const puzzle = room && Puzzle.findById(room.puzzleId);
          if (!room || !puzzle) {
            console.error("Room or puzzle not found for game start");
            return;
          }

          io.to(socketRoom).emit("game_started", {
            puzzle: puzzle.grid,
            solution: puzzle.solution,
            startedAt: room.startedAt,
          });
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
      const roomCode = codeOf(data);
      if (!roomCode || !sudokuMember(roomCode)) return;

      playerSocket.to(sudokuSocketRoom(roomCode)).emit("cell_update", {
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
      const roomCode = codeOf(data);
      const member = roomCode && sudokuMember(roomCode);
      if (!roomCode || !member) return;

      io.to(sudokuSocketRoom(roomCode)).emit("progress_update", {
        visitorId,
        name: member.player.name,
        progress: data.progress,
        errors: data.errors,
      });
    });

    playerSocket.on("pause_game", (data: { roomCode: string; paused: boolean }) => {
      const roomCode = codeOf(data);
      const member = roomCode && sudokuMember(roomCode);
      if (!roomCode || !member) return;

      io.to(sudokuSocketRoom(roomCode)).emit("game_paused", {
        visitorId,
        name: member.player.name,
        paused: data.paused === true,
      });
    });

    playerSocket.on("ping", () => {
      playerSocket.emit("pong");
    });

    playerSocket.on("reconnect_game", (data: { roomCode: string }) => {
      const roomCode = codeOf(data);
      const member = roomCode && sudokuMember(roomCode);
      if (!roomCode || !member) return;

      const socketRoom = sudokuSocketRoom(roomCode);
      const existingTimeout = disconnectTimeouts.get(`${socketRoom}_${visitorId}`);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        disconnectTimeouts.delete(`${socketRoom}_${visitorId}`);
      }

      enterSocketRoom(socketRoom);
      io.to(socketRoom).emit("player_reconnected", { visitorId, name: member.player.name });
    });

    // Caro game events. Nước đi, kết thúc ván và bỏ cuộc đi qua API; API phát sự kiện sau khi kiểm tra.
    playerSocket.on("caro_join_room", (data: { roomCode: string }) => {
      const roomCode = codeOf(data);
      if (!roomCode) return;
      const socketRoom = caroSocketRoom(roomCode);

      enterSocketRoom(socketRoom);

      const member = caroMember(roomCode);
      if (!member) return;

      const memberName = member.player.name;
      io.to(socketRoom).emit("caro_player_joined", { visitorId, name: memberName });
      io.to(socketRoom).emit("caro_room_updated", {
        roomCode,
        action: "player_joined",
        playerId: visitorId,
        playerName: memberName,
      });
      console.log(`${memberName} joined caro room ${roomCode}`);
    });

    playerSocket.on("caro_set_ready", (data: { roomCode: string; ready: boolean }) => {
      const roomCode = codeOf(data);
      if (!roomCode || !caroMember(roomCode)) return;

      const ready = data.ready === true;
      try {
        CaroRoom.updatePlayerReady(roomCode, visitorId, ready);
      } catch (error) {
        console.error("Failed to update caro ready status:", error);
      }

      io.to(caroSocketRoom(roomCode)).emit("caro_player_ready", { visitorId, ready });
    });

    playerSocket.on("caro_start_game", (data: { roomCode: string }) => {
      const roomCode = codeOf(data);
      if (!roomCode) return;

      const member = caroMember(roomCode);
      if (!member || member.room.status !== "playing") return;

      const socketRoom = caroSocketRoom(roomCode);
      io.to(socketRoom).emit("caro_game_starting", { countdown: 3 });

      setTimeout(() => {
        try {
          const room = CaroRoom.findByCode(roomCode);
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

          startCaroTurnTimeout(io, roomCode);
        } catch (error) {
          console.error("Error starting caro game:", error);
        }
      }, 3000);
    });

    playerSocket.on("caro_pause_game", (data: { roomCode: string; paused: boolean }) => {
      const roomCode = codeOf(data);
      const member = roomCode && caroMember(roomCode);
      if (!roomCode || !member || member.room.status !== "playing") return;

      const paused = data.paused === true;
      if (paused) {
        clearCaroTurnTimeout(roomCode);
      } else {
        startCaroTurnTimeout(io, roomCode);
      }
      io.to(caroSocketRoom(roomCode)).emit("caro_game_paused", {
        visitorId,
        name: member.player.name,
        paused,
      });
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
      
      const room = CaroRoom.findByCode(roomCode);
      if (!room || room.status !== "playing") {
        return;
      }
      
      // Find current player and opponent
      const currentPlayer = room.players.find((p) => p.symbol === room.currentTurn);
      const opponent = room.players.find((p) => p.symbol !== room.currentTurn);
      
      // Current player loses due to timeout
      room.status = "finished";
      room.winnerId = opponent?.visitorId || null;
      room.finishedAt = new Date();
      room.save();
      
      const socketRoom = caroSocketRoom(roomCode);
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
