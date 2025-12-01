import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerResult {
  playerId: string;
  displayName: string;
  completionTime: number | null;
  mistakesCount: number;
  status: "completed" | "gave_up" | "in_progress";
  rank?: number;
}

export interface IGameHistory extends Document {
  roomCode: string;
  puzzleId: mongoose.Types.ObjectId;
  difficulty: string;
  players: IPlayerResult[];
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
}

const PlayerResultSchema = new Schema<IPlayerResult>(
  {
    playerId: { type: String, required: true },
    displayName: { type: String, required: true },
    completionTime: { type: Number, default: null },
    mistakesCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["completed", "gave_up", "in_progress"],
      default: "in_progress",
    },
    rank: { type: Number },
  },
  { _id: false }
);

const GameHistorySchema = new Schema<IGameHistory>(
  {
    roomCode: { type: String, required: true, index: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: "Puzzle", required: true },
    difficulty: { type: String, required: true },
    players: [PlayerResultSchema],
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

GameHistorySchema.index({ createdAt: -1 });
GameHistorySchema.index({ "players.playerId": 1 });

export const GameHistory =
  mongoose.models.GameHistory ||
  mongoose.model<IGameHistory>("GameHistory", GameHistorySchema);
