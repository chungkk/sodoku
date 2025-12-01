import { Server as SocketIOServer, Socket } from "socket.io";

interface AuthenticatedSocket extends Socket {
  sessionId?: string;
  playerId?: string;
  displayName?: string;
  currentRoom?: string;
}

interface ActiveRoom {
  code: string;
  hostSocketId: string;
  players: Map<
    string,
    {
      playerId: string;
      displayName: string;
      isReady: boolean;
      isConnected: boolean;
    }
  >;
  status: "waiting" | "playing" | "finished";
  gameStartTime?: number;
}

const activeRooms = new Map<string, ActiveRoom>();
const socketToPlayer = new Map<string, { sessionId: string; roomCode?: string }>();

export function setupSocketHandlers(io: SocketIOServer): void {
  io.use((socket: AuthenticatedSocket, next) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (!sessionId) {
      return next(new Error("Session ID required"));
    }
    socket.sessionId = sessionId;
    next();
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id}, session: ${socket.sessionId}`);

    socketToPlayer.set(socket.id, { sessionId: socket.sessionId! });

    socket.emit("connected", {
      socketId: socket.id,
      sessionId: socket.sessionId,
    });

    socket.on("room:join", ({ roomCode }) => {
      handleRoomJoin(io, socket, roomCode);
    });

    socket.on("room:leave", ({ roomCode }) => {
      handleRoomLeave(io, socket, roomCode);
    });

    socket.on("room:ready", ({ roomCode, isReady }) => {
      handleRoomReady(io, socket, roomCode, isReady);
    });

    socket.on("room:start", ({ roomCode }) => {
      handleRoomStart(io, socket, roomCode);
    });

    socket.on("game:started", ({ roomCode, puzzle, startTime }) => {
      handleGameStarted(io, socket, roomCode, puzzle, startTime);
    });

    socket.on("game:player-completed", ({ roomCode, completionTime, rank }) => {
      handlePlayerCompleted(io, socket, roomCode, completionTime, rank);
    });

    socket.on("game:player-gave-up", ({ roomCode }) => {
      handlePlayerGaveUp(io, socket, roomCode);
    });

    socket.on("game:finished", ({ roomCode, results }) => {
      handleGameFinished(io, socket, roomCode, results);
    });

    socket.on("room:rejoin", ({ roomCode, sessionId }) => {
      handleRoomRejoin(io, socket, roomCode, sessionId);
    });

    socket.on("disconnect", () => {
      handleDisconnect(io, socket);
    });
  });

  setInterval(() => {
    syncTimers(io);
  }, 10000);
}

function handleRoomJoin(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string
): void {
  const room = activeRooms.get(roomCode);

  if (!room) {
    socket.emit("room:error", {
      code: "ROOM_NOT_FOUND",
      message: "Room not found",
    });
    return;
  }

  if (room.status !== "waiting") {
    socket.emit("room:error", {
      code: "GAME_ALREADY_STARTED",
      message: "Game has already started",
    });
    return;
  }

  if (room.players.size >= 4) {
    socket.emit("room:error", {
      code: "ROOM_FULL",
      message: "Room is full",
    });
    return;
  }

  socket.join(roomCode);
  socket.currentRoom = roomCode;

  const playerInfo = socketToPlayer.get(socket.id);
  if (playerInfo) {
    playerInfo.roomCode = roomCode;
  }

  room.players.set(socket.id, {
    playerId: socket.sessionId!,
    displayName: socket.displayName || "Player",
    isReady: false,
    isConnected: true,
  });

  io.to(roomCode).emit("room:player-joined", {
    player: {
      id: socket.sessionId,
      displayName: socket.displayName || "Player",
      isReady: false,
      isConnected: true,
    },
  });
}

function handleRoomLeave(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  socket.leave(roomCode);
  room.players.delete(socket.id);

  const playerInfo = socketToPlayer.get(socket.id);
  if (playerInfo) {
    playerInfo.roomCode = undefined;
  }

  let newHostId: string | undefined;
  if (room.hostSocketId === socket.id && room.players.size > 0) {
    const firstPlayer = room.players.entries().next().value;
    if (firstPlayer) {
      room.hostSocketId = firstPlayer[0];
      newHostId = firstPlayer[1].playerId;
    }
  }

  io.to(roomCode).emit("room:player-left", {
    playerId: socket.sessionId,
    newHostId,
  });

  if (room.players.size === 0) {
    activeRooms.delete(roomCode);
  }

  socket.currentRoom = undefined;
}

function handleRoomReady(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string,
  isReady: boolean
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  const player = room.players.get(socket.id);
  if (player) {
    player.isReady = isReady;
    io.to(roomCode).emit("room:player-ready", {
      playerId: socket.sessionId,
      isReady,
    });
  }
}

function handleRoomStart(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  if (room.hostSocketId !== socket.id) {
    socket.emit("room:error", {
      code: "NOT_HOST",
      message: "Only the host can start the game",
    });
    return;
  }

  if (room.players.size < 2) {
    socket.emit("room:error", {
      code: "NOT_ENOUGH_PLAYERS",
      message: "Need at least 2 players to start",
    });
    return;
  }

  io.to(roomCode).emit("game:starting", { countdown: 3 });
}

function handleRoomRejoin(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string,
  sessionId: string
): void {
  const room = activeRooms.get(roomCode);
  if (!room) {
    socket.emit("room:error", {
      code: "ROOM_NOT_FOUND",
      message: "Room not found",
    });
    return;
  }

  let existingSocketId: string | null = null;
  const entries = Array.from(room.players.entries());
  for (const [sockId, player] of entries) {
    if (player.playerId === sessionId) {
      existingSocketId = sockId;
      break;
    }
  }

  if (existingSocketId) {
    const playerData = room.players.get(existingSocketId);
    if (playerData) {
      room.players.delete(existingSocketId);
      playerData.isConnected = true;
      room.players.set(socket.id, playerData);
    }
  }

  socket.join(roomCode);
  socket.currentRoom = roomCode;

  io.to(roomCode).emit("room:player-reconnected", {
    playerId: sessionId,
  });

  socket.emit("room:state", {
    room: {
      code: roomCode,
      hostSocketId: room.hostSocketId,
      players: Array.from(room.players.values()),
      status: room.status,
    },
    gameState: room.status === "playing" ? { gameStartTime: room.gameStartTime } : undefined,
  });
}

function handleDisconnect(io: SocketIOServer, socket: AuthenticatedSocket): void {
  console.log(`Socket disconnected: ${socket.id}`);

  const playerInfo = socketToPlayer.get(socket.id);
  if (playerInfo?.roomCode) {
    const room = activeRooms.get(playerInfo.roomCode);
    if (room) {
      const player = room.players.get(socket.id);
      if (player) {
        player.isConnected = false;

        if (room.status === "waiting") {
          room.players.delete(socket.id);
          
          let newHostId: string | undefined;
          if (room.hostSocketId === socket.id && room.players.size > 0) {
            const entries = Array.from(room.players.entries());
            const firstEntry = entries[0];
            if (firstEntry) {
              room.hostSocketId = firstEntry[0];
              newHostId = firstEntry[1].playerId;
            }
          }

          io.to(playerInfo.roomCode).emit("room:player-left", {
            playerId: socket.sessionId,
            newHostId,
          });

          if (room.players.size === 0) {
            activeRooms.delete(playerInfo.roomCode);
          }
        } else {
          io.to(playerInfo.roomCode).emit("room:player-disconnected", {
            playerId: socket.sessionId,
          });

          setTimeout(() => {
            const currentRoom = activeRooms.get(playerInfo.roomCode!);
            if (currentRoom) {
              const currentPlayer = Array.from(currentRoom.players.values()).find(
                p => p.playerId === socket.sessionId
              );
              if (currentPlayer && !currentPlayer.isConnected) {
                const socketId = Array.from(currentRoom.players.entries()).find(
                  ([, p]) => p.playerId === socket.sessionId
                )?.[0];
                if (socketId) {
                  currentRoom.players.delete(socketId);
                  io.to(playerInfo.roomCode!).emit("room:player-left", {
                    playerId: socket.sessionId,
                  });
                }
              }
            }
          }, 60000);
        }
      }
    }
  }

  socketToPlayer.delete(socket.id);
}

function handleGameStarted(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string,
  puzzle: string,
  startTime: number
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  if (room.hostSocketId !== socket.id) {
    return;
  }

  room.status = "playing";
  room.gameStartTime = startTime;

  io.to(roomCode).emit("game:started", {
    puzzle,
    startTime,
    serverTimeOffset: Date.now() - startTime,
  });
}

function handlePlayerCompleted(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string,
  completionTime: number,
  rank: number
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  const player = room.players.get(socket.id);
  if (!player) return;

  io.to(roomCode).emit("game:player-completed", {
    playerId: socket.sessionId,
    displayName: player.displayName,
    completionTime,
    rank,
  });
}

function handlePlayerGaveUp(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  const player = room.players.get(socket.id);
  if (!player) return;

  io.to(roomCode).emit("game:player-gave-up", {
    playerId: socket.sessionId,
    displayName: player.displayName,
  });
}

interface PlayerResult {
  playerId: string;
  displayName: string;
  status: string;
  completionTime: number | null;
  mistakesCount: number;
  rank: number | null;
}

function handleGameFinished(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomCode: string,
  results: PlayerResult[]
): void {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  if (room.hostSocketId !== socket.id) return;

  room.status = "finished";

  io.to(roomCode).emit("game:finished", { results });
}

function syncTimers(io: SocketIOServer): void {
  const now = Date.now();
  const entries = Array.from(activeRooms.entries());
  
  for (const [code, room] of entries) {
    if (room.status === "playing" && room.gameStartTime) {
      const elapsed = now - room.gameStartTime;
      io.to(code).emit("game:time-sync", {
        serverTime: now,
        gameElapsed: elapsed,
      });
    }
  }
}

export function createRoom(
  code: string,
  hostSocketId: string,
  hostPlayerId: string,
  hostDisplayName: string
): ActiveRoom {
  const room: ActiveRoom = {
    code,
    hostSocketId,
    players: new Map([
      [
        hostSocketId,
        {
          playerId: hostPlayerId,
          displayName: hostDisplayName,
          isReady: false,
          isConnected: true,
        },
      ],
    ]),
    status: "waiting",
  };
  activeRooms.set(code, room);
  return room;
}

export function getRoom(code: string): ActiveRoom | undefined {
  return activeRooms.get(code);
}

export function deleteRoom(code: string): void {
  activeRooms.delete(code);
}

export { activeRooms };
