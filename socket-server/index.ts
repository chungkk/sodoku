import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sudoku";

mongoose.connect(MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Models (simplified for socket server)
const RoomSchema = new mongoose.Schema({
  code: String,
  hostId: String,
  puzzleId: mongoose.Schema.Types.ObjectId,
  players: [{
    visitorId: String,
    name: String,
    isHost: Boolean,
    isReady: Boolean,
    isConnected: Boolean,
    progress: Number,
    errors: Number,
  }],
  status: String,
  difficulty: String,
  startedAt: Date,
  finishedAt: Date,
  winnerId: String,
}, { timestamps: true });

const PuzzleSchema = new mongoose.Schema({
  grid: [[Number]],
  solution: [[Number]],
  difficulty: String,
});

const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);
const Puzzle = mongoose.models.Puzzle || mongoose.model("Puzzle", PuzzleSchema);

// Socket handlers
interface PlayerSocket {
  visitorId: string;
  name: string;
  roomCode?: string;
}

const playerSockets = new Map<string, PlayerSocket>();

io.on("connection", (socket) => {
  const { visitorId, name } = socket.handshake.auth;
  
  if (!visitorId || !name) {
    socket.disconnect();
    return;
  }

  console.log(`Player connected: ${name} (${visitorId})`);
  playerSockets.set(socket.id, { visitorId, name });

  // Join room
  socket.on("join_room", async (data: { roomCode: string }) => {
    const { roomCode } = data;
    const playerData = playerSockets.get(socket.id);
    if (!playerData) return;

    if (playerData.roomCode) {
      socket.leave(playerData.roomCode);
    }

    socket.join(roomCode);
    playerData.roomCode = roomCode;

    io.to(roomCode).emit("player_joined", { visitorId, name });
    console.log(`${name} joined room ${roomCode}`);
  });

  // Leave room
  socket.on("leave_room", (data: { roomCode: string }) => {
    const { roomCode } = data;
    socket.leave(roomCode);
    io.to(roomCode).emit("player_left", { visitorId });
  });

  // Set ready
  socket.on("set_ready", async (data: { roomCode: string; ready: boolean }) => {
    const { roomCode, ready } = data;
    
    try {
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

  // Start game
  socket.on("start_game", async (data: { roomCode: string }) => {
    const { roomCode } = data;
    
    io.to(roomCode).emit("game_starting", { countdown: 3 });
    
    setTimeout(async () => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room || !room.puzzleId) {
          console.error("Room or puzzle not found");
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

  // Cell update
  socket.on("cell_update", (data: {
    roomCode: string;
    row: number;
    col: number;
    value: number | null;
  }) => {
    socket.to(data.roomCode).emit("cell_update", {
      visitorId,
      ...data,
    });
  });

  // Progress update
  socket.on("progress_update", (data: {
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

  // Complete puzzle
  socket.on("complete_puzzle", async (data: {
    roomCode: string;
    time: number;
    errors: number;
  }) => {
    io.to(data.roomCode).emit("player_completed", {
      visitorId,
      name,
      time: data.time,
      errors: data.errors,
    });
  });

  // Give up
  socket.on("give_up", (data: { roomCode: string }) => {
    io.to(data.roomCode).emit("player_gave_up", { visitorId, name });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const playerData = playerSockets.get(socket.id);
    if (playerData?.roomCode) {
      io.to(playerData.roomCode).emit("player_disconnected", { visitorId });
    }
    playerSockets.delete(socket.id);
    console.log(`Player disconnected: ${name}`);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", connections: playerSockets.size });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
