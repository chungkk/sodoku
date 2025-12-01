import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayerProgress extends Document {
  roomId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  currentBoard: string;
  mistakesCount: number;
  hintsUsed: number;
  status: "playing" | "completed" | "gave_up";
  completionTime?: number;
  completedAt?: Date;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerProgressSchema = new Schema<IPlayerProgress>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
      index: true,
    },
    currentBoard: {
      type: String,
      required: true,
      minlength: 81,
      maxlength: 81,
      validate: {
        validator: (v: string) => /^[0-9]{81}$/.test(v),
        message: "Board must be 81 digits (0-9)",
      },
    },
    mistakesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["playing", "completed", "gave_up"],
      default: "playing",
    },
    completionTime: {
      type: Number,
      min: 0,
    },
    completedAt: {
      type: Date,
    },
    rank: {
      type: Number,
      min: 1,
      max: 4,
    },
  },
  {
    timestamps: true,
  }
);

PlayerProgressSchema.index({ roomId: 1, playerId: 1 }, { unique: true });

const PlayerProgress: Model<IPlayerProgress> =
  mongoose.models.PlayerProgress ||
  mongoose.model<IPlayerProgress>("PlayerProgress", PlayerProgressSchema);

export default PlayerProgress;
