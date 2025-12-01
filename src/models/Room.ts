import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoomSettings {
  difficulty: "easy" | "medium" | "hard";
  maxPlayers: number;
}

export interface IRoom extends Document {
  code: string;
  hostPlayerId: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[];
  status: "waiting" | "playing" | "finished";
  settings: IRoomSettings;
  puzzleId?: mongoose.Types.ObjectId;
  gameStartedAt?: Date;
  gameEndedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
      index: true,
    },
    hostPlayerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
      index: true,
    },
    settings: {
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      maxPlayers: {
        type: Number,
        min: 2,
        max: 4,
        default: 4,
      },
    },
    puzzleId: {
      type: Schema.Types.ObjectId,
      ref: "Puzzle",
    },
    gameStartedAt: {
      type: Date,
    },
    gameEndedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
