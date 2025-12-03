export type Difficulty = "easy" | "medium" | "hard" | "expert" | "master" | "extreme";

export interface SudokuPuzzle {
  grid: number[][];
  solution: number[][];
  difficulty: Difficulty;
  givenCells: number;
}

export interface CellConflict {
  row: number;
  col: number;
}

const DIFFICULTY_RANGES: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 36, max: 40 },
  medium: { min: 30, max: 35 },
  hard: { min: 24, max: 29 },
  expert: { min: 22, max: 26 },
  master: { min: 20, max: 24 },
  extreme: { min: 17, max: 21 },
};

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createEmptyGrid(): number[][] {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));
}

function deepCopyGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

function solveSudoku(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid: number[][], limit = 2): number {
  let count = 0;

  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;
              if (solve()) {
                grid[row][col] = 0;
                count++;
                if (count >= limit) return true;
              } else {
                grid[row][col] = 0;
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve();
  return count;
}

function generateSolution(): number[][] {
  const grid = createEmptyGrid();
  solveSudoku(grid);
  return grid;
}

function removeCells(solution: number[][], difficulty: Difficulty): number[][] {
  const grid = deepCopyGrid(solution);
  const { min, max } = DIFFICULTY_RANGES[difficulty];
  const targetGiven = Math.floor(Math.random() * (max - min + 1)) + min;
  const cellsToRemove = 81 - targetGiven;

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  const shuffledPositions = shuffleArray(positions);
  let removed = 0;

  for (const [row, col] of shuffledPositions) {
    if (removed >= cellsToRemove) break;

    const backup = grid[row][col];
    grid[row][col] = 0;

    const testGrid = deepCopyGrid(grid);
    if (countSolutions(testGrid) === 1) {
      removed++;
    } else {
      grid[row][col] = backup;
    }
  }

  return grid;
}

export function generatePuzzle(difficulty: Difficulty): SudokuPuzzle {
  const solution = generateSolution();
  const grid = removeCells(solution, difficulty);

  let givenCells = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) givenCells++;
    }
  }

  return {
    grid,
    solution,
    difficulty,
    givenCells,
  };
}

export function findConflicts(
  grid: number[][],
  row: number,
  col: number,
  value: number
): CellConflict[] {
  const conflicts: CellConflict[] = [];

  if (value === 0) return conflicts;

  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) {
      conflicts.push({ row, col: c });
    }
  }

  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) {
      conflicts.push({ row: r, col });
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) {
        conflicts.push({ row: r, col: c });
      }
    }
  }

  return conflicts;
}

export function hasConflict(
  grid: number[][],
  row: number,
  col: number,
  value: number
): boolean {
  return findConflicts(grid, row, col, value).length > 0;
}

export function isPuzzleComplete(grid: number[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

export function calculateProgress(grid: number[][], solution: number[][]): number {
  let correct = 0;
  let total = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (solution[r][c] !== 0) {
        total++;
        if (grid[r][c] === solution[r][c]) {
          correct++;
        }
      }
    }
  }

  return Math.round((correct / total) * 100);
}

export function isValidGrid(grid: number[][]): boolean {
  if (!grid || grid.length !== 9) return false;

  for (let r = 0; r < 9; r++) {
    if (!grid[r] || grid[r].length !== 9) return false;
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (typeof val !== "number" || val < 0 || val > 9) return false;
    }
  }

  return true;
}

export function validateSolution(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
    }
  }

  for (let r = 0; r < 9; r++) {
    const row = new Set<number>();
    for (let c = 0; c < 9; c++) {
      if (row.has(grid[r][c])) return false;
      row.add(grid[r][c]);
    }
  }

  for (let c = 0; c < 9; c++) {
    const col = new Set<number>();
    for (let r = 0; r < 9; r++) {
      if (col.has(grid[r][c])) return false;
      col.add(grid[r][c]);
    }
  }

  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      const box = new Set<number>();
      for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
        for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
          if (box.has(grid[r][c])) return false;
          box.add(grid[r][c]);
        }
      }
    }
  }

  return true;
}
