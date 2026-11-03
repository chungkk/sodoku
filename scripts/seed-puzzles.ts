import { generatePuzzle } from "../src/lib/sudoku";
import Puzzle, { type Difficulty } from "../src/models/Puzzle";

const PUZZLES_PER_DIFFICULTY = 50;

// Chạy lại nhiều lần vẫn an toàn: chỉ tạo phần còn thiếu.
for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
  const missing = PUZZLES_PER_DIFFICULTY - Puzzle.countPregenerated(difficulty);
  for (let i = 0; i < missing; i++) {
    const { grid, solution } = generatePuzzle(difficulty);
    Puzzle.create({
      grid,
      solution,
      difficulty,
      givenCells: grid.flat().filter((c) => c !== 0).length,
      isPregenerated: true,
    });
  }
  if (missing > 0) console.log(`Seeded ${missing} ${difficulty} puzzles`);
}

console.log(`Pre-generated puzzles: ${Puzzle.countPregenerated()}`);
