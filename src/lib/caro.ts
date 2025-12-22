export type CellValue = "X" | "O" | null;
export type Board = CellValue[][];

export const BOARD_SIZE = 15;
export const WIN_CONDITION = 5;

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

export function checkWinner(
  board: Board,
  row: number,
  col: number,
  player: CellValue
): boolean {
  if (!player) return false;

  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let posEnd = 0;
    let negEnd = 0;

    // Check positive direction
    for (let i = 1; i < WIN_CONDITION; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (
        newRow < 0 ||
        newRow >= BOARD_SIZE ||
        newCol < 0 ||
        newCol >= BOARD_SIZE
      ) {
        posEnd = -1; // Out of bounds = blocked
        break;
      }
      if (board[newRow][newCol] !== player) {
        posEnd = board[newRow][newCol] ? -1 : 1; // Enemy = blocked, Empty = open
        break;
      }
      count++;
    }

    // If stopped but not set, check next cell
    if (posEnd === 0) {
      const nextRow = row + dx * count;
      const nextCol = col + dy * count;
      if (
        nextRow < 0 ||
        nextRow >= BOARD_SIZE ||
        nextCol < 0 ||
        nextCol >= BOARD_SIZE
      ) {
        posEnd = -1;
      } else {
        posEnd = board[nextRow][nextCol] ? -1 : 1;
      }
    }

    // Check negative direction
    let negCount = 0;
    for (let i = 1; i < WIN_CONDITION; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (
        newRow < 0 ||
        newRow >= BOARD_SIZE ||
        newCol < 0 ||
        newCol >= BOARD_SIZE
      ) {
        negEnd = -1; // Out of bounds = blocked
        break;
      }
      if (board[newRow][newCol] !== player) {
        negEnd = board[newRow][newCol] ? -1 : 1; // Enemy = blocked, Empty = open
        break;
      }
      count++;
      negCount++;
    }

    // If stopped but not set, check next cell
    if (negEnd === 0) {
      const nextRow = row - dx * (negCount + 1);
      const nextCol = col - dy * (negCount + 1);
      if (
        nextRow < 0 ||
        nextRow >= BOARD_SIZE ||
        nextCol < 0 ||
        nextCol >= BOARD_SIZE
      ) {
        negEnd = -1;
      } else {
        negEnd = board[nextRow][nextCol] ? -1 : 1;
      }
    }

    // Win only if: count >= 5 AND at least one end is open (not blocked)
    if (count >= WIN_CONDITION && (posEnd === 1 || negEnd === 1)) {
      return true;
    }
  }

  return false;
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

export function isValidMove(board: Board, row: number, col: number): boolean {
  return (
    row >= 0 &&
    row < BOARD_SIZE &&
    col >= 0 &&
    col < BOARD_SIZE &&
    board[row][col] === null
  );
}
