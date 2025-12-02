import mongoose from "mongoose";
import { generatePuzzle, Difficulty } from "../src/lib/sudoku";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sudoku";

const PuzzleSchema = new mongoose.Schema({
  grid: { type: [[Number]], required: true },
  solution: { type: [[Number]], required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  givenCells: { type: Number, required: true },
  isPregenerated: { type: Boolean, default: true },
}, { timestamps: true });

PuzzleSchema.index({ difficulty: 1, isPregenerated: 1 });

const Puzzle = mongoose.models.Puzzle || mongoose.model("Puzzle", PuzzleSchema);

const PUZZLES_PER_DIFFICULTY = 50;

async function seedPuzzles() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!");

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  for (const difficulty of difficulties) {
    console.log(`\nGenerating ${PUZZLES_PER_DIFFICULTY} ${difficulty} puzzles...`);
    
    // Check existing count
    const existingCount = await Puzzle.countDocuments({ 
      difficulty, 
      isPregenerated: true 
    });
    
    const toGenerate = PUZZLES_PER_DIFFICULTY - existingCount;
    
    if (toGenerate <= 0) {
      console.log(`Already have ${existingCount} ${difficulty} puzzles. Skipping.`);
      continue;
    }

    console.log(`Existing: ${existingCount}, Generating: ${toGenerate}`);

    const puzzles = [];
    for (let i = 0; i < toGenerate; i++) {
      const { grid, solution } = generatePuzzle(difficulty);
      puzzles.push({
        grid,
        solution,
        difficulty,
        givenCells: grid.flat().filter(c => c !== 0).length,
        isPregenerated: true,
      });
      
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  Generated ${i + 1}/${toGenerate}\r`);
      }
    }

    await Puzzle.insertMany(puzzles);
    console.log(`  Inserted ${toGenerate} ${difficulty} puzzles.`);
  }

  const totalCount = await Puzzle.countDocuments({ isPregenerated: true });
  console.log(`\nTotal pre-generated puzzles: ${totalCount}`);

  await mongoose.disconnect();
  console.log("Done!");
}

seedPuzzles().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
