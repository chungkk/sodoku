import mongoose, { Schema, Document } from "mongoose";

export interface ICaroPlayer {
  visitorId: string;
  name: string;
  symbol: "X" | "O" | null;
  isReady: boolean;
  isConnected: boolean;
}

export interface ICaroMove {
  row: number;
  col: number;
  symbol: "X" | "O";
  timestamp: Date;
}

export interface ICaroRoom extends Document {
  code: string;
  players: ICaroPlayer[];
  board: (string | null)[][];
  currentTurn: "X" | "O";
  status: "waiting" | "playing" | "finished";
  winnerId: string | null;
  moves: ICaroMove[];
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  turnStartedAt?: Date;
  isPaused?: boolean;
  pausedBy?: string | null;
  pausedAt?: Date;
  remainingTime?: number;
}

const CaroPlayerSchema = new Schema({
  visitorId: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, enum: ["X", "O", null], default: null },
  isReady: { type: Boolean, default: false },
  isConnected: { type: Boolean, default: true },
});

const CaroMoveSchema = new Schema({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  symbol: { type: String, enum: ["X", "O"], required: true },
  timestamp: { type: Date, default: Date.now },
});

const CaroRoomSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  players: [CaroPlayerSchema],
  board: { type: [[String]], default: [] },
  currentTurn: { type: String, enum: ["X", "O"], default: "X" },
  status: {
    type: String,
    enum: ["waiting", "playing", "finished"],
    default: "waiting",
  },
  winnerId: { type: String, default: null },
  moves: [CaroMoveSchema],
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  turnStartedAt: { type: Date },
  isPaused: { type: Boolean, default: false },
  pausedBy: { type: String, default: null },
  pausedAt: { type: Date },
  remainingTime: { type: Number },
});

export default mongoose.models.CaroRoom ||
  mongoose.model<ICaroRoom>("CaroRoom", CaroRoomSchema);
