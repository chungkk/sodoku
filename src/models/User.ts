import mongoose, { Schema, Document, Model } from "mongoose";

export interface GameRecord {
  date: Date;
  mode: "practice" | "solo";
  difficulty: "easy" | "medium" | "hard";
  time: number;
  errors: number;
  result: "completed" | "abandoned" | "won" | "lost";
  roomCode?: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  gameHistory: GameRecord[];
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
  addGameRecord(record: Omit<GameRecord, "date">): Promise<IUser>;
}

const GameRecordSchema = new Schema<GameRecord>(
  {
    date: { type: Date, default: Date.now },
    mode: { type: String, enum: ["practice", "solo"], required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    time: { type: Number, required: true },
    errors: { type: Number, default: 0 },
    result: {
      type: String,
      enum: ["completed", "abandoned", "won", "lost"],
      required: true,
    },
    roomCode: { type: String },
  },
  { _id: false, suppressReservedKeysWarning: true }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 60,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    gameHistory: {
      type: [GameRecordSchema],
      default: [],
      validate: {
        validator: function (v: GameRecord[]) {
          return v.length <= 50;
        },
        message: "Game history cannot exceed 50 records",
      },
    },
    stats: {
      totalGames: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      bestTime: {
        easy: { type: Number, default: null },
        medium: { type: Number, default: null },
        hard: { type: Number, default: null },
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ createdAt: -1 });

UserSchema.methods.addGameRecord = function (record: Omit<GameRecord, "date">) {
  const gameRecord: GameRecord = {
    ...record,
    date: new Date(),
  };

  this.gameHistory.unshift(gameRecord);
  if (this.gameHistory.length > 50) {
    this.gameHistory = this.gameHistory.slice(0, 50);
  }

  this.stats.totalGames += 1;
  if (record.result === "won") {
    this.stats.wins += 1;
  }

  const currentBest = this.stats.bestTime[record.difficulty];
  if (
    (record.result === "completed" || record.result === "won") &&
    (currentBest === null || record.time < currentBest)
  ) {
    this.stats.bestTime[record.difficulty] = record.time;
  }

  return this.save();
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
