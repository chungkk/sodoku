import mongoose, { Schema, Document, Model } from "mongoose";

export type Difficulty = "easy" | "medium" | "hard";

export interface IPuzzle extends Document {
  grid: number[][];
  solution: number[][];
  difficulty: Difficulty;
  givenCells: number;
  isPregenerated: boolean;
  createdAt: Date;
}

const PuzzleSchema = new Schema<IPuzzle>(
  {
    grid: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function (v: number[][]) {
          if (v.length !== 9) return false;
          return v.every(
            (row) =>
              row.length === 9 &&
              row.every((cell) => cell >= 0 && cell <= 9)
          );
        },
        message: "Grid must be 9x9 with values 0-9",
      },
    },
    solution: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function (v: number[][]) {
          if (v.length !== 9) return false;
          return v.every(
            (row) =>
              row.length === 9 &&
              row.every((cell) => cell >= 1 && cell <= 9)
          );
        },
        message: "Solution must be 9x9 with values 1-9",
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    givenCells: {
      type: Number,
      required: true,
      min: 17,
      max: 81,
    },
    isPregenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PuzzleSchema.index({ difficulty: 1, isPregenerated: 1 });
PuzzleSchema.index({ createdAt: -1 });

PuzzleSchema.statics.getRandomByDifficulty = async function (
  difficulty: Difficulty
): Promise<IPuzzle | null> {
  // Prefer pre-generated puzzles
  const pregeneratedCount = await this.countDocuments({ 
    difficulty, 
    isPregenerated: true 
  });
  
  if (pregeneratedCount > 0) {
    const random = Math.floor(Math.random() * pregeneratedCount);
    return this.findOne({ difficulty, isPregenerated: true }).skip(random);
  }

  // Fallback to any puzzle
  const count = await this.countDocuments({ difficulty });
  if (count === 0) return null;

  const random = Math.floor(Math.random() * count);
  return this.findOne({ difficulty }).skip(random);
};

const Puzzle: Model<IPuzzle> =
  mongoose.models.Puzzle || mongoose.model<IPuzzle>("Puzzle", PuzzleSchema);

export default Puzzle;
