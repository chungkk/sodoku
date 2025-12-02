import { Server, Socket } from "socket.io";

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
      console.log(`${name} joined room ${roomCode}`);
    });

    playerSocket.on("leave_room", (data: { roomCode: string }) => {
      const { roomCode } = data;
      handleLeaveRoom(io, playerSocket, roomCode);
    });

    playerSocket.on("set_ready", (data: { roomCode: string; ready: boolean }) => {
      const { roomCode, ready } = data;
      io.to(roomCode).emit("player_ready", { visitorId, ready });
    });

    playerSocket.on("start_game", (data: { roomCode: string }) => {
      const { roomCode } = data;
      io.to(roomCode).emit("game_starting", { countdown: 3 });
    });

    playerSocket.on("cell_update", (data: {
      roomCode: string;
      row: number;
      col: number;
      value: number | null;
    }) => {
      playerSocket.to(data.roomCode).emit("cell_update", {
        visitorId,
        ...data,
      });
    });

    playerSocket.on("progress_update", (data: {
      roomCode: string;
      progress: number;
      errors: number;
    }) => {
      playerSocket.to(data.roomCode).emit("progress_update", {
        visitorId,
        progress: data.progress,
        errors: data.errors,
      });
    });

    playerSocket.on("complete_puzzle", (data: {
      roomCode: string;
      grid: number[][];
    }) => {
      io.to(data.roomCode).emit("player_completed", {
        visitorId,
        name,
        time: Date.now(),
      });
    });

    playerSocket.on("give_up", (data: { roomCode: string }) => {
      io.to(data.roomCode).emit("player_gave_up", { visitorId, name });
    });

    playerSocket.on("ping", () => {
      playerSocket.emit("pong");
    });

    playerSocket.on("disconnect", (reason) => {
      console.log(`Player disconnected: ${name} (${visitorId}) - ${reason}`);
      playerSockets.delete(visitorId);

      if (playerSocket.roomCode) {
        handleLeaveRoom(io, playerSocket, playerSocket.roomCode, true);
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
