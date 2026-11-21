export type CellValue = "X" | "O" | null;
export type Board = CellValue[][];

export const BOARD_SIZE = 15;
export const WIN_CONDITION = 5;
export const TURN_TIMEOUT_MS = 5 * 60 * 1000;
/** Tổng thời gian mỗi người được tạm dừng trong một ván; hết quỹ thì ván tự chạy tiếp. */
export const MAX_PAUSE_MS_PER_PLAYER = 3 * 60 * 1000;

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

export function findWinningCells(
  board: Board,
  row: number,
  col: number,
  player: CellValue
): { row: number; col: number }[] {
  if (!player) return [];
  const opponent: CellValue = player === "X" ? "O" : "X";

  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ];

  const isInBounds = (r: number, c: number) =>
    r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

  for (const [dx, dy] of directions) {
    const cells: { row: number; col: number }[] = [{ row, col }];

    // Chiều dương
    let r = row + dx;
    let c = col + dy;
    while (isInBounds(r, c) && board[r][c] === player) {
      cells.push({ row: r, col: c });
      r += dx;
      c += dy;
    }
    const posBlocked = isInBounds(r, c) && board[r][c] === opponent;

    // Chiều âm
    r = row - dx;
    c = col - dy;
    while (isInBounds(r, c) && board[r][c] === player) {
      cells.push({ row: r, col: c });
      r -= dx;
      c -= dy;
    }
    const negBlocked = isInBounds(r, c) && board[r][c] === opponent;

    // Thắng khi đủ >= 5 quân liên tiếp và không bị quân đối thủ chặn cả 2 đầu
    if (cells.length >= WIN_CONDITION && !(posBlocked && negBlocked)) {
      return cells;
    }
  }

  return [];
}

export function checkWinner(
  board: Board,
  row: number,
  col: number,
  player: CellValue
): boolean {
  return findWinningCells(board, row, col, player).length >= WIN_CONDITION;
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
