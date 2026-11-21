/** Tổng thời gian mỗi người được tạm dừng trong một ván đối kháng; hết quỹ thì ván tự chạy tiếp. */
export const MAX_PAUSE_MS_PER_PLAYER = 3 * 60 * 1000;
/** Số lần tối đa mỗi người được hỏi server đếm số ô đang sai trong một ván đối kháng. */
export const MAX_CHECKS_PER_GAME = 2;

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

// Bảng đếm bit cho mặt nạ 9-bit (0..511) giúp tìm ô ít ứng viên nhất (MRV) trong O(1)
const POPCOUNT = new Uint8Array(512);
for (let i = 1; i < 512; i++) {
  POPCOUNT[i] = POPCOUNT[i >> 1] + (i & 1);
}

const BOX_INDEX = new Uint8Array(81);
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    BOX_INDEX[r * 9 + c] = Math.floor(r / 3) * 3 + Math.floor(c / 3);
  }
}

function countSolutions(grid: number[][], limit = 2): number {
  const rowMask = new Int32Array(9);
  const colMask = new Int32Array(9);
  const boxMask = new Int32Array(9);
  const emptyCells: number[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val === 0) {
        emptyCells.push(r * 9 + c);
      } else {
        const bit = 1 << (val - 1);
        const b = BOX_INDEX[r * 9 + c];
        if ((rowMask[r] | colMask[c] | boxMask[b]) & bit) return 0;
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }

  let count = 0;
  const totalEmpty = emptyCells.length;

  function solve(depth: number): void {
    if (count >= limit) return;
    if (depth === totalEmpty) {
      count++;
      return;
    }

    // MRV: chọn ô trống có ít ứng viên nhất rồi đổi chỗ về vị trí depth
    let bestIdx = depth;
    let bestMask = 0;
    let bestCount = 10;

    for (let i = depth; i < totalEmpty; i++) {
      const pos = emptyCells[i];
      const r = (pos / 9) | 0;
      const c = pos % 9;
      const b = BOX_INDEX[pos];
      const avail = ~(rowMask[r] | colMask[c] | boxMask[b]) & 0x1ff;
      if (avail === 0) return;
      const cnt = POPCOUNT[avail];
      if (cnt < bestCount) {
        bestCount = cnt;
        bestIdx = i;
        bestMask = avail;
        if (cnt === 1) break;
      }
    }

    const pos = emptyCells[bestIdx];
    emptyCells[bestIdx] = emptyCells[depth];
    emptyCells[depth] = pos;

    const r = (pos / 9) | 0;
    const c = pos % 9;
    const b = BOX_INDEX[pos];

    let mask = bestMask;
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[b] |= bit;
      solve(depth + 1);
      rowMask[r] ^= bit;
      colMask[c] ^= bit;
      boxMask[b] ^= bit;
      if (count >= limit) break;
    }

    emptyCells[depth] = emptyCells[bestIdx];
    emptyCells[bestIdx] = pos;
  }

  solve(0);
  return count;
}

function generateSolution(): number[][] {
  const grid = createEmptyGrid();
  solveSudoku(grid);
  return grid;
}

function removeCells(solution: number[][], difficulty: Difficulty): { grid: number[][]; solution: number[][] } {
  const { min, max } = DIFFICULTY_RANGES[difficulty];
  const targetGiven = Math.floor(Math.random() * (max - min + 1)) + min;
  const cellsToRemove = 81 - targetGiven;

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  const maxAttempts = difficulty === "extreme" ? 36 : difficulty === "master" ? 12 : 4;
  const deadlineMs = Date.now() + (difficulty === "extreme" ? 120 : 80);
  let bestSolution = solution;
  let bestGrid = deepCopyGrid(solution);
  let bestGiven = 81;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0 && Date.now() > deadlineMs) break;
    // Với mức extreme, thử đổi lời giải gốc sau mỗi 6 lượt để thoát cực tiểu cục bộ
    const baseSolution =
      difficulty === "extreme" && attempt > 0 && attempt % 6 === 0
        ? generateSolution()
        : bestSolution === solution || attempt < 6
          ? solution
          : generateSolution();

    const grid = deepCopyGrid(baseSolution);
    const shuffledPositions = shuffleArray(positions);
    let removed = 0;

    for (const [row, col] of shuffledPositions) {
      if (removed >= cellsToRemove) break;

      const backup = grid[row][col];
      grid[row][col] = 0;

      if (countSolutions(grid) === 1) {
        removed++;
      } else {
        grid[row][col] = backup;
      }
    }

    const given = 81 - removed;
    if (given < bestGiven) {
      bestGiven = given;
      bestGrid = grid;
      bestSolution = baseSolution;
    }
    if (given <= max) break;
  }

  return { grid: bestGrid, solution: bestSolution };
}

// Hạt giống 21 ô cho sẵn đã kiểm chứng nghiệm duy nhất; phép biến đổi đẳng cấu
// (hoán vị chữ số 9!, hoán vị dải/hàng/cột, chuyển vị) sinh hàng nghìn tỷ đề extreme khác nhau trong <1ms.
const EXTREME_SEEDS = [
  "000800003004006070000200050600905000000070020080000000000000600005003008702000091",
  "000500081600904000000800003030000040700000000905017300050006200000000090008000000",
  "000000930000800000092000070000410006000007000300065000000940020100000600805001000",
  "005000007000004091460003000006000000000100000384000600001030000000090082000008070",
  "000360500700050000000900008090000030000006000000580000013004000002890005600000007",
  "060000000200850004100300070540000200000000000000006010800000500003009160000070030",
];

function solveDeterministic(grid: number[][]): number[][] {
  const copy = deepCopyGrid(grid);
  const rowMask = new Int32Array(9);
  const colMask = new Int32Array(9);
  const boxMask = new Int32Array(9);
  const emptyCells: number[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = copy[r][c];
      if (val === 0) {
        emptyCells.push(r * 9 + c);
      } else {
        const bit = 1 << (val - 1);
        const b = BOX_INDEX[r * 9 + c];
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }

  function backtrack(depth: number): boolean {
    if (depth === emptyCells.length) return true;
    let bestIdx = depth;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = depth; i < emptyCells.length; i++) {
      const pos = emptyCells[i];
      const r = (pos / 9) | 0;
      const c = pos % 9;
      const b = BOX_INDEX[pos];
      const avail = ~(rowMask[r] | colMask[c] | boxMask[b]) & 0x1ff;
      if (avail === 0) return false;
      const cnt = POPCOUNT[avail];
      if (cnt < bestCount) {
        bestCount = cnt;
        bestIdx = i;
        bestMask = avail;
        if (cnt === 1) break;
      }
    }

    const pos = emptyCells[bestIdx];
    emptyCells[bestIdx] = emptyCells[depth];
    emptyCells[depth] = pos;

    const r = (pos / 9) | 0;
    const c = pos % 9;
    const b = BOX_INDEX[pos];

    let mask = bestMask;
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      const digit = 32 - Math.clz32(bit);
      copy[r][c] = digit;
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[b] |= bit;
      if (backtrack(depth + 1)) return true;
      copy[r][c] = 0;
      rowMask[r] ^= bit;
      colMask[c] ^= bit;
      boxMask[b] ^= bit;
    }

    emptyCells[depth] = emptyCells[bestIdx];
    emptyCells[bestIdx] = pos;
    return false;
  }

  backtrack(0);
  return copy;
}

function generateExtremeFromSeed(): { grid: number[][]; solution: number[][] } {
  const seed = EXTREME_SEEDS[Math.floor(Math.random() * EXTREME_SEEDS.length)];
  const digitMap = [0, ...shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])];
  const rowOrder = shuffleArray([0, 1, 2]).flatMap((band) =>
    shuffleArray([0, 1, 2]).map((offset) => band * 3 + offset)
  );
  const colOrder = shuffleArray([0, 1, 2]).flatMap((stack) =>
    shuffleArray([0, 1, 2]).map((offset) => stack * 3 + offset)
  );
  const transpose = Math.random() < 0.5;

  const grid = createEmptyGrid();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const sr = rowOrder[r];
      const sc = colOrder[c];
      const ch = seed.charCodeAt(sr * 9 + sc) - 48;
      const val = digitMap[ch];
      if (transpose) grid[c][r] = val;
      else grid[r][c] = val;
    }
  }
  const solution = solveDeterministic(grid);
  return { grid, solution };
}

export function generatePuzzle(difficulty: Difficulty): SudokuPuzzle {
  const { grid, solution } =
    difficulty === "extreme"
      ? generateExtremeFromSeed()
      : removeCells(generateSolution(), difficulty);

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

export function calculateProgress(grid: number[][], solution: number[][], puzzle?: number[][]): number {
  let correct = 0;
  let total = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle) {
        // Chỉ đếm các ô trống ban đầu (ô cần điền)
        if (puzzle[r][c] === 0) {
          total++;
          if (grid[r][c] === solution[r][c]) {
            correct++;
          }
        }
      } else {
        // Fallback: đếm tất cả các ô
        if (solution[r][c] !== 0) {
          total++;
          if (grid[r][c] === solution[r][c]) {
            correct++;
          }
        }
      }
    }
  }

  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/**
 * Tiến độ khi client không có lời giải: tỉ lệ ô đã điền hợp lệ (không bị trùng theo luật Sudoku).
 * Chỉ đạt 100 khi bàn đã giải đúng, nên không cho biết từng ô đúng hay sai theo đáp án.
 */
export function calculateFillProgress(grid: number[][], puzzle: number[][]): number {
  let validFilled = 0;
  let total = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] === 0) {
        total++;
        const value = grid[r][c];
        if (value && !hasConflict(grid, r, c, value)) {
          validFilled++;
        }
      }
    }
  }
  if (total === 0 || validateSolution(grid)) return 100;
  return Math.min(99, Math.round((validFilled / total) * 100));
}

/** Đếm số ô người chơi đã điền nhưng khác đáp án (bỏ qua ô trống và ô đề bài). */
export function countWrongCells(
  grid: number[][],
  puzzle: number[][],
  solution: number[][]
): number {
  let wrong = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] === 0 && grid[r][c] !== 0 && grid[r][c] !== solution[r][c]) {
        wrong++;
      }
    }
  }
  return wrong;
}

/** Bàn đã điền đủ, đúng luật Sudoku và giữ nguyên các ô đề bài. */
export function isSolutionOf(grid: number[][], puzzle: number[][]): boolean {
  if (!isValidGrid(grid)) return false;
  const keepsGivens = puzzle.every((row, r) =>
    row.every((given, c) => given === 0 || grid[r][c] === given)
  );
  return keepsGivens && validateSolution(grid);
}

export function isValidGrid(grid: number[][]): boolean {
  if (!grid || grid.length !== 9) return false;

  for (let r = 0; r < 9; r++) {
    if (!grid[r] || grid[r].length !== 9) return false;
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (!Number.isInteger(val) || val < 0 || val > 9) return false;
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
