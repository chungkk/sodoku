import { Server, Socket } from "socket.io";
import CaroRoom from "../models/CaroRoom";
import Puzzle from "../models/Puzzle";
import Room from "../models/Room";
import { isValidPlayerToken } from "../lib/player-token";
import { RateLimiter } from "../lib/rate-limit";
import { caroSocketRoom, setRealtime, sudokuSocketRoom } from "../lib/realtime";
import { cleanPlayerName, clientProgress, isCount } from "../lib/validation";

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
// Đủ dài để khoá màn hình hay rớt mạng ngắn không bị xử thua
const DISCONNECT_TIMEOUT = 2 * 60 * 1000;
const CARO_START_ANNOUNCE_WINDOW_MS = 15 * 1000;
const socketEventLimiter = new RateLimiter(300, 60 * 1000);

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
    caroTurnStarted: (roomCode) => scheduleCaroTimer(io, roomCode),
    caroTurnEnded: clearCaroTurnTimeout,
  });

  recoverAfterRestart(io);

  io.use((socket: Socket, next) => {
    const auth = socket.handshake.auth as SocketAuth;
    if (!cleanPlayerName(auth?.name) || !isValidPlayerToken(auth.visitorId, auth.token)) {
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

    // Không gọi next() thì sự kiện bị bỏ qua
    playerSocket.use((_event, next) => {
      if (socketEventLimiter.allow(playerSocket.id)) next();
    });

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
      // Đã quay lại phòng thì huỷ đếm giờ vắng mặt (áp dụng cho cả Sudoku lẫn Caro)
      const disconnectKey = `${socketRoom}_${visitorId}`;
      clearTimeout(disconnectTimeouts.get(disconnectKey));
      disconnectTimeouts.delete(disconnectKey);

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
            startedAt: room.startedAt,
          });
        } catch (error) {
          console.error("Error starting game:", error);
        }
      }, 3000);
    });

    playerSocket.on("progress_update", (data: {
      roomCode: string;
      progress: number;
      errors: number;
    }) => {
      const roomCode = codeOf(data);
      const member = roomCode && sudokuMember(roomCode);
      const progress = clientProgress(data?.progress);
      if (!roomCode || !member || progress === null || !isCount(data.errors)) return;

      io.to(sudokuSocketRoom(roomCode)).emit("progress_update", {
        visitorId,
        name: member.player.name,
        progress,
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

      // Chỉ để chạy đếm ngược ngay sau khi API bắt đầu ván; đồng hồ lượt do API khởi động
      const startedAt = member.room.startedAt?.getTime() ?? 0;
      if (Date.now() - startedAt > CARO_START_ANNOUNCE_WINDOW_MS) return;

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
        } catch (error) {
          console.error("Error starting caro game:", error);
        }
      }, 3000);
    });

    playerSocket.on("caro_pause_game", (data: { roomCode: string; paused: boolean }) => {
      const roomCode = codeOf(data);
      const member = roomCode && caroMember(roomCode);
      if (!roomCode || !member || member.room.status !== "playing") return;

      const { room } = member;
      const paused = data.paused === true;
      if (paused) {
        if (!room.pause(visitorId)) return;
      } else {
        // Chỉ người đã dừng mới được cho chạy tiếp; quá quỹ thì server tự chạy tiếp
        if (room.pausedBy !== visitorId) return;
        room.resume();
      }
      room.save();
      scheduleCaroTimer(io, roomCode);

      io.to(caroSocketRoom(roomCode)).emit("caro_game_paused", {
        visitorId,
        name: member.player.name,
        paused,
        turnStartedAt: room.turnStartedAt,
      });
    });

    playerSocket.on("disconnect", (reason) => {
      console.log(`Player disconnected: ${name} (${visitorId}) - ${reason}`);
      // Socket cũ có thể ngắt sau khi socket mới của cùng người chơi đã kết nối (chuyển trang)
      if (playerSockets.get(visitorId) === playerSocket) {
        playerSockets.delete(visitorId);
      }

      const roomCode = playerSocket.roomCode;
      if (!roomCode || isInSocketRoom(io, visitorId, roomCode)) return;

      io.to(roomCode).emit("player_disconnected", {
        visitorId,
        name,
        timeout: DISCONNECT_TIMEOUT / 1000,
      });

      const disconnectKey = `${roomCode}_${visitorId}`;
      clearTimeout(disconnectTimeouts.get(disconnectKey));
      disconnectTimeouts.set(
        disconnectKey,
        setTimeout(() => {
          disconnectTimeouts.delete(disconnectKey);
          if (isInSocketRoom(io, visitorId, roomCode)) return;

          handleLeaveRoom(io, playerSocket, roomCode, true);
          io.to(roomCode).emit("player_timeout", { visitorId, name });

          // Caro không cần xử thua ở đây: đồng hồ lượt tự kết thúc ván
          const sudokuPrefix = sudokuSocketRoom("");
          if (roomCode.startsWith(sudokuPrefix)) {
            forfeitSudokuPlayer(io, roomCode.slice(sudokuPrefix.length), visitorId);
          }
        }, DISCONNECT_TIMEOUT)
      );
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

function isInSocketRoom(io: Server, visitorId: string, socketRoom: string): boolean {
  for (const socketId of io.sockets.adapter.rooms.get(socketRoom) ?? []) {
    const socket = io.sockets.sockets.get(socketId) as PlayerSocket | undefined;
    if (socket?.auth.visitorId === visitorId) return true;
  }
  return false;
}

/** Xử thua người vắng mặt quá lâu để ván không treo ở trạng thái "playing" mãi. */
function forfeitSudokuPlayer(io: Server, roomCode: string, visitorId: string): void {
  try {
    const room = Room.findByCode(roomCode);
    const player = room?.players.find((p) => p.visitorId === visitorId);
    if (!room || !player || room.status !== "playing" || !room.giveUp(visitorId)) return;
    room.save();

    const socketRoom = sudokuSocketRoom(roomCode);
    io.to(socketRoom).emit("player_gave_up", { visitorId, name: player.name });
    if (room.isFinished) {
      io.to(socketRoom).emit("game_ended", { winnerId: room.winnerId, reason: "abandoned" });
    }
  } catch (error) {
    console.error("Failed to forfeit player:", error);
  }
}

/** Đồng hồ nằm trong bộ nhớ nên mất khi server khởi động lại (mỗi lần deploy): dựng lại từ DB. */
function recoverAfterRestart(io: Server): void {
  try {
    for (const room of CaroRoom.findPlaying()) {
      scheduleCaroTimer(io, room.code);
    }
  } catch (error) {
    console.error("Failed to restore caro timers:", error);
  }

  // Cho người chơi thời gian kết nối lại; ai vẫn vắng thì xử lý như vừa ngắt kết nối
  setTimeout(() => {
    try {
      for (const room of Room.findPlaying()) {
        const socketRoom = sudokuSocketRoom(room.code);
        for (const player of room.players) {
          if (!player.finishedAt && !isInSocketRoom(io, player.visitorId, socketRoom)) {
            forfeitSudokuPlayer(io, room.code, player.visitorId);
          }
        }
      }
    } catch (error) {
      console.error("Failed to check absent players:", error);
    }
  }, DISCONNECT_TIMEOUT);
}

/** Đặt đồng hồ theo trạng thái trong DB. Gọi lại bao nhiêu lần cũng không kéo dài được lượt. */
function scheduleCaroTimer(io: Server, roomCode: string): void {
  clearCaroTurnTimeout(roomCode);

  const room = CaroRoom.findByCode(roomCode);
  if (!room || room.status !== "playing") return;

  caroTurnTimeouts.set(
    roomCode,
    setTimeout(() => handleCaroTimer(io, roomCode), room.nextTimerDelayMs())
  );
}

function handleCaroTimer(io: Server, roomCode: string): void {
  caroTurnTimeouts.delete(roomCode);
  try {
    const room = CaroRoom.findByCode(roomCode);
    if (!room || room.status !== "playing") return;

    const socketRoom = caroSocketRoom(roomCode);

    // Hết quỹ tạm dừng: tự chạy tiếp thay vì để ván treo
    if (room.pausedBy) {
      const pauser = room.players.find((p) => p.visitorId === room.pausedBy);
      const visitorId = room.pausedBy;
      room.resume();
      room.save();
      scheduleCaroTimer(io, roomCode);
      io.to(socketRoom).emit("caro_game_paused", {
        visitorId,
        name: pauser?.name,
        paused: false,
        turnStartedAt: room.turnStartedAt,
      });
      return;
    }

    const currentPlayer = room.players.find((p) => p.symbol === room.currentTurn);
    const opponent = room.players.find((p) => p.symbol !== room.currentTurn);

    room.status = "finished";
    room.winnerId = opponent?.visitorId || null;
    room.finishedAt = new Date();
    room.save();

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
    console.error("Error handling caro timer:", error);
  }
}

function clearCaroTurnTimeout(roomCode: string): void {
  const timeoutId = caroTurnTimeouts.get(roomCode);
  if (timeoutId) {
    clearTimeout(timeoutId);
    caroTurnTimeouts.delete(roomCode);
  }
}
