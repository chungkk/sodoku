import { getDb } from "../lib/db";

export type Difficulty = "easy" | "medium" | "hard";

export interface IPuzzle {
  id: number;
  grid: number[][];
  solution: number[][];
  difficulty: Difficulty;
  givenCells: number;
  isPregenerated: boolean;
  createdAt: Date;
}

type NewPuzzle = Omit<IPuzzle, "id" | "createdAt">;

interface PuzzleRow {
  id: number;
  difficulty: string;
  is_pregenerated: number;
  given_cells: number;
  grid: string;
  solution: string;
  created_at: string;
}

function fromRow(row: PuzzleRow): IPuzzle {
  return {
    id: row.id,
    grid: JSON.parse(row.grid),
    solution: JSON.parse(row.solution),
    difficulty: row.difficulty as Difficulty,
    givenCells: row.given_cells,
    isPregenerated: row.is_pregenerated === 1,
    createdAt: new Date(row.created_at),
  };
}

const Puzzle = {
  create(puzzle: NewPuzzle): IPuzzle {
    const createdAt = new Date();
    const { lastInsertRowid } = getDb()
      .prepare(
        `INSERT INTO puzzles (difficulty, is_pregenerated, given_cells, grid, solution, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        puzzle.difficulty,
        puzzle.isPregenerated ? 1 : 0,
        puzzle.givenCells,
        JSON.stringify(puzzle.grid),
        JSON.stringify(puzzle.solution),
        createdAt.toISOString()
      );
    return { ...puzzle, id: Number(lastInsertRowid), createdAt };
  },

  findById(id: number | null): IPuzzle | null {
    if (id === null) return null;
    const row = getDb().prepare("SELECT * FROM puzzles WHERE id = ?").get(id);
    return row ? fromRow(row as unknown as PuzzleRow) : null;
  },

  /** Ưu tiên puzzle tạo sẵn, không có thì lấy bất kỳ puzzle nào cùng độ khó. */
  getRandomByDifficulty(difficulty: Difficulty): IPuzzle | null {
    const row = getDb()
      .prepare(
        `SELECT * FROM puzzles WHERE difficulty = ?
         ORDER BY is_pregenerated DESC, RANDOM() LIMIT 1`
      )
      .get(difficulty);
    return row ? fromRow(row as unknown as PuzzleRow) : null;
  },

  countPregenerated(difficulty?: Difficulty): number {
    const db = getDb();
    const row = difficulty
      ? db
          .prepare("SELECT COUNT(*) AS n FROM puzzles WHERE is_pregenerated = 1 AND difficulty = ?")
          .get(difficulty)
      : db.prepare("SELECT COUNT(*) AS n FROM puzzles WHERE is_pregenerated = 1").get();
    return Number((row as { n: number }).n);
  },
};

export default Puzzle;
