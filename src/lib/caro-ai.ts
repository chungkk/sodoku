import type { Board, CellValue } from "./caro";
import { BOARD_SIZE, WIN_CONDITION, isValidMove } from "./caro";

type Position = { row: number; col: number };

// Evaluate a line of cells for scoring
function evaluateLine(
  board: Board,
  row: number,
  col: number,
  dx: number,
  dy: number,
  player: CellValue
): number {
  if (!player) return 0;

  const opponent = player === "X" ? "O" : "X";
  let count = 0;
  let openEnds = 0;
  let blocked = 0;

  // Count consecutive pieces and check ends
  for (let i = 0; i < WIN_CONDITION; i++) {
    const r = row + dx * i;
    const c = col + dy * i;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
      blocked++;
      break;
    }
    const cell = board[r][c];
    if (cell === player) count++;
    else if (cell === opponent) {
      blocked++;
      break;
    }
  }

  // Check start end
  const startR = row - dx;
  const startC = col - dy;
  if (startR >= 0 && startR < BOARD_SIZE && startC >= 0 && startC < BOARD_SIZE) {
    if (board[startR][startC] === null) openEnds++;
    else if (board[startR][startC] === opponent) blocked++;
  } else {
    blocked++;
  }

  // Check far end
  const endR = row + dx * count;
  const endC = col + dy * count;
  if (endR >= 0 && endR < BOARD_SIZE && endC >= 0 && endC < BOARD_SIZE) {
    if (board[endR][endC] === null) openEnds++;
    else if (board[endR][endC] === opponent) blocked++;
  } else {
    blocked++;
  }

  if (blocked >= 2) return 0;

  // Scoring based on count and open ends
  const scores: { [key: number]: number } = {
    5: 100000,
    4: openEnds === 2 ? 10000 : 1000,
    3: openEnds === 2 ? 1000 : 100,
    2: openEnds === 2 ? 100 : 10,
    1: 1,
  };

  return scores[count] || 0;
}

// Evaluate the entire board for a player
function evaluateBoard(board: Board, player: CellValue): number {
  if (!player) return 0;

  let score = 0;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) {
        for (const [dx, dy] of directions) {
          score += evaluateLine(board, row, col, dx, dy, player);
        }
      }
    }
  }

  return score;
}

// Get all valid moves near existing pieces
function getRelevantMoves(board: Board): Position[] {
  const moves: Position[] = [];
  const checked = new Set<string>();

  // Find cells near existing pieces (within 2 cells)
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const r = row + dr;
            const c = col + dc;
            const key = `${r},${c}`;
            if (!checked.has(key) && isValidMove(board, r, c)) {
              checked.add(key);
              moves.push({ row: r, col: c });
            }
          }
        }
      }
    }
  }

  // If board is empty, start from center
  if (moves.length === 0) {
    const center = Math.floor(BOARD_SIZE / 2);
    moves.push({ row: center, col: center });
  }

  return moves;
}

// Check if a position creates a winning line
function checkWinningMove(
  board: Board,
  row: number,
  col: number,
  player: CellValue
): boolean {
  if (!player) return false;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;

    // Positive direction
    for (let i = 1; i < WIN_CONDITION; i++) {
      const r = row + dx * i;
      const c = col + dy * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      count++;
    }

    // Negative direction
    for (let i = 1; i < WIN_CONDITION; i++) {
      const r = row - dx * i;
      const c = col - dy * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      count++;
    }

    if (count >= WIN_CONDITION) return true;
  }

  return false;
}

// Minimax with alpha-beta pruning
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: CellValue,
  humanPlayer: CellValue
): number {
  if (depth === 0) {
    const aiScore = evaluateBoard(board, aiPlayer);
    const humanScore = evaluateBoard(board, humanPlayer);
    return aiScore - humanScore * 1.1; // Slightly prioritize blocking
  }

  const moves = getRelevantMoves(board);
  if (moves.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      board[move.row][move.col] = aiPlayer;

      // Check for immediate win
      if (checkWinningMove(board, move.row, move.col, aiPlayer)) {
        board[move.row][move.col] = null;
        return 100000 + depth;
      }

      const evaluation = minimax(board, depth - 1, alpha, beta, false, aiPlayer, humanPlayer);
      board[move.row][move.col] = null;

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      board[move.row][move.col] = humanPlayer;

      // Check for immediate win
      if (checkWinningMove(board, move.row, move.col, humanPlayer)) {
        board[move.row][move.col] = null;
        return -100000 - depth;
      }

      const evaluation = minimax(board, depth - 1, alpha, beta, true, aiPlayer, humanPlayer);
      board[move.row][move.col] = null;

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Main AI function to get the best move
export function getBestMove(
  board: Board,
  aiPlayer: CellValue,
  depth: number = 3
): Position | null {
  if (!aiPlayer) return null;

  const humanPlayer = aiPlayer === "X" ? "O" : "X";
  const moves = getRelevantMoves(board);

  if (moves.length === 0) return null;

  // First, check for immediate winning move
  for (const move of moves) {
    board[move.row][move.col] = aiPlayer;
    if (checkWinningMove(board, move.row, move.col, aiPlayer)) {
      board[move.row][move.col] = null;
      return move;
    }
    board[move.row][move.col] = null;
  }

  // Second, check if we need to block opponent's winning move
  for (const move of moves) {
    board[move.row][move.col] = humanPlayer;
    if (checkWinningMove(board, move.row, move.col, humanPlayer)) {
      board[move.row][move.col] = null;
      return move;
    }
    board[move.row][move.col] = null;
  }

  // Use minimax for deeper analysis
  let bestMove: Position | null = null;
  let bestScore = -Infinity;

  // Limit moves for performance
  const limitedMoves = moves.slice(0, 20);

  for (const move of limitedMoves) {
    board[move.row][move.col] = aiPlayer;
    const score = minimax(board, depth, -Infinity, Infinity, false, aiPlayer, humanPlayer);
    board[move.row][move.col] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
