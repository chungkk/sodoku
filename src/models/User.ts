import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserStats {
  wins: number;
  losses: number;
  totalGames: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  points: number;
  stats: IUserStats;
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    wins: {
      type: Number,
      default: 0,
      min: 0,
    },
    losses: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGames: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
      index: -1, // Descending index for leaderboard
    },
    stats: {
      type: UserStatsSchema,
      default: () => ({
        wins: 0,
        losses: 0,
        totalGames: 0,
      }),
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
