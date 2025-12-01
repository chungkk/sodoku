import sudoku from "sudoku";

export interface GeneratedPuzzle {
  initialBoard: string;
  solution: string;
  difficulty: "easy" | "medium" | "hard";
  givens: number;
}

export function generatePuzzle(difficulty: "easy" | "medium" | "hard" = "medium"): GeneratedPuzzle {
  const difficultyMap = {
    easy: 45,
    medium: 35,
    hard: 25,
  };

  const targetGivens = difficultyMap[difficulty];
  
  const puzzle = sudoku.makepuzzle();
  const solution = sudoku.solvepuzzle(puzzle);

  if (!solution) {
    throw new Error("Failed to generate valid puzzle");
  }

  const initialBoard = puzzle
    .map((cell: number | null) => (cell === null ? "0" : String(cell + 1)))
    .join("");

  const solutionBoard = solution
    .map((cell: number) => String(cell + 1))
    .join("");

  const givens = initialBoard.split("").filter((c: string) => c !== "0").length;

  return {
    initialBoard,
    solution: solutionBoard,
    difficulty,
    givens,
  };
}

export function validateCell(
  solution: string,
  row: number,
  col: number,
  value: number
): boolean {
  const index = row * 9 + col;
  return solution[index] === String(value);
}

export function validateBoard(currentBoard: string, solution: string): boolean {
  return currentBoard === solution;
}

export function isBoardComplete(board: string): boolean {
  return !board.includes("0");
}

export function getConflicts(
  board: string,
  row: number,
  col: number,
  value: number
): { row: number; col: number }[] {
  const conflicts: { row: number; col: number }[] = [];
  const index = row * 9 + col;

  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row * 9 + c] === String(value)) {
      conflicts.push({ row, col: c });
    }
  }

  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r * 9 + col] === String(value)) {
      conflicts.push({ row: r, col });
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r * 9 + c] === String(value)) {
        conflicts.push({ row: r, col: c });
      }
    }
  }

  return conflicts;
}

export function boardToGrid(board: string): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < 9; r++) {
    const row: number[] = [];
    for (let c = 0; c < 9; c++) {
      row.push(parseInt(board[r * 9 + c], 10));
    }
    grid.push(row);
  }
  return grid;
}

export function gridToBoard(grid: number[][]): string {
  return grid.flat().join("");
}
