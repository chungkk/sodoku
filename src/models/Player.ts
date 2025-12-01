import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayer extends Document {
  sessionId: string;
  displayName: string;
  userId?: mongoose.Types.ObjectId;
  isGuest: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  currentRoomCode?: string;
  connectionStatus: "connected" | "disconnected" | "reconnecting";
}

const PlayerSchema = new Schema<IPlayer>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    isGuest: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    currentRoomCode: {
      type: String,
      index: true,
    },
    connectionStatus: {
      type: String,
      enum: ["connected", "disconnected", "reconnecting"],
      default: "connected",
    },
  },
  {
    timestamps: true,
  }
);

PlayerSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Player: Model<IPlayer> =
  mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;
