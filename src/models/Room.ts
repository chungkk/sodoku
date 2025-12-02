import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { Difficulty } from "./Puzzle";

export type RoomStatus = "waiting" | "playing" | "finished";

export interface IPlayer {
visitorId: string;
  oderId: Types.ObjectId | null;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  progress: number;
  errors: number;
  currentGrid: number[][];
  finishedAt: Date | null;
  lastSeen: Date;
}

export interface IRoom extends Document {
  code: string;
  hostId: string;
  puzzleId: Types.ObjectId | null;
  players: IPlayer[];
  status: RoomStatus;
  difficulty: Difficulty;
  startedAt: Date | null;
  finishedAt: Date | null;
  winnerId: string | null;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
visitorId: { type: String, required: true },
    oderId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true, maxlength: 20 },
    isHost: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    errors: { type: Number, default: 0, min: 0 },
    currentGrid: { type: [[Number]], default: [] },
    finishedAt: { type: Date, default: null },
    lastSeen: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RoomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: [/^[A-Z0-9]{6}$/, "Room code must be 6 uppercase alphanumeric characters"],
    },
    hostId: { type: String, required: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: "Puzzle", default: null },
    players: {
      type: [PlayerSchema],
      default: [],
      validate: {
        validator: function (v: IPlayer[]) {
          return v.length <= 4;
        },
        message: "Room cannot have more than 4 players",
      },
    },
    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    winnerId: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

RoomSchema.index({ code: 1 }, { unique: true });
RoomSchema.index({ status: 1 });
RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

RoomSchema.statics.generateRoomCode = function (): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

RoomSchema.statics.createRoom = async function (
  hostId: string,
  hostName: string,
  difficulty: Difficulty,
  userId: Types.ObjectId | null = null
): Promise<IRoom> {
  let code: string;
  let exists = true;

  while (exists) {
    code = this.generateRoomCode();
    exists = await this.exists({ code });
  }

  const room = new this({
    code: code!,
    hostId,
    difficulty,
    players: [
      {
visitorId: hostId,
        oderId: userId,
        name: hostName,
        isHost: true,
        isReady: true,
        isConnected: true,
      },
    ],
  });

  return room.save();
};

RoomSchema.methods.addPlayer = function (
visitorId: string,
  name: string,
  userId: Types.ObjectId | null = null
): boolean {
  if (this.players.length >= 4) return false;
  if (this.status !== "waiting") return false;
  if (this.players.some((p: IPlayer) => p.visitorId === visitorId)) return false;

  this.players.push({
visitorId,
    oderId: userId,
    name,
    isHost: false,
    isReady: false,
    isConnected: true,
    progress: 0,
    errors: 0,
    currentGrid: [],
    finishedAt: null,
    lastSeen: new Date(),
  });

  return true;
};

RoomSchema.methods.removePlayer = function (visitorId: string): boolean {
  const index = this.players.findIndex((p: IPlayer) => p.visitorId === visitorId);
  if (index === -1) return false;

  const wasHost = this.players[index].isHost;
  this.players.splice(index, 1);

  if (wasHost && this.players.length > 0) {
    this.players[0].isHost = true;
    this.hostId = this.players[0].visitorId;
  }

  return true;
};

RoomSchema.methods.setPlayerReady = function (
visitorId: string,
  ready: boolean
): boolean {
  const player = this.players.find((p: IPlayer) => p.visitorId === visitorId);
  if (!player) return false;

  player.isReady = ready;
  return true;
};

RoomSchema.methods.canStart = function (): boolean {
  if (this.status !== "waiting") return false;
  if (this.players.length < 2) return false;

  const nonHostPlayers = this.players.filter((p: IPlayer) => !p.isHost);
  return nonHostPlayers.some((p: IPlayer) => p.isReady);
};

const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
