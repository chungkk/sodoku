import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPuzzle extends Document {
  initialBoard: string;
  solution: string;
  difficulty: "easy" | "medium" | "hard";
  givens: number;
  createdAt: Date;
}

const PuzzleSchema = new Schema<IPuzzle>(
  {
    initialBoard: {
      type: String,
      required: true,
      minlength: 81,
      maxlength: 81,
      validate: {
        validator: (v: string) => /^[0-9]{81}$/.test(v),
        message: "Board must be 81 digits (0-9)",
      },
    },
    solution: {
      type: String,
      required: true,
      minlength: 81,
      maxlength: 81,
      validate: {
        validator: (v: string) => /^[1-9]{81}$/.test(v),
        message: "Solution must be 81 digits (1-9)",
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    givens: {
      type: Number,
      required: true,
      min: 17,
      max: 81,
    },
  },
  {
    timestamps: true,
  }
);

PuzzleSchema.index({ createdAt: -1 });

const Puzzle: Model<IPuzzle> =
  mongoose.models.Puzzle || mongoose.model<IPuzzle>("Puzzle", PuzzleSchema);

export default Puzzle;
