"use client";

import { useState, useCallback } from "react";
import {
  Board,
  CellValue,
  createEmptyBoard,
  checkWinner,
  isBoardFull,
  isValidMove,
} from "@/lib/caro";

interface UseCaroGameReturn {
  board: Board;
  currentTurn: CellValue;
  winner: CellValue;
  isDraw: boolean;
  winningCells: { row: number; col: number }[];
  lastMove: { row: number; col: number } | null;
  makeMove: (row: number, col: number, player: CellValue) => boolean;
  resetGame: () => void;
  loadBoard: (board: Board, turn: CellValue) => void;
  setLastMove: (move: { row: number; col: number } | null) => void;
}

export function useCaroGame(): UseCaroGameReturn {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentTurn, setCurrentTurn] = useState<CellValue>("X");
  const [winner, setWinner] = useState<CellValue>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState<{ row: number; col: number }[]>([]);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const makeMove = useCallback(
    (row: number, col: number, player: CellValue): boolean => {
      if (winner || isDraw || !player) return false;
      if (!isValidMove(board, row, col)) return false;

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = player;
      setBoard(newBoard);
      setLastMove({ row, col });

      if (checkWinner(newBoard, row, col, player)) {
        setWinner(player);
        // Tìm các ô winning để highlight
        const cells = findWinningCells(newBoard, row, col, player);
        setWinningCells(cells);
        return true;
      }

      if (isBoardFull(newBoard)) {
        setIsDraw(true);
        return true;
      }

      setCurrentTurn(player === "X" ? "O" : "X");
      return true;
    },
    [board, winner, isDraw]
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentTurn("X");
    setWinner(null);
    setIsDraw(false);
    setWinningCells([]);
    setLastMove(null);
  }, []);

  const loadBoard = useCallback((board: Board, turn: CellValue) => {
    setBoard(board);
    setCurrentTurn(turn);
  }, []);

  return {
    board,
    currentTurn,
    winner,
    isDraw,
    winningCells,
    lastMove,
    makeMove,
    resetGame,
    loadBoard,
    setLastMove,
  };
}

function findWinningCells(
  board: Board,
  row: number,
  col: number,
  player: CellValue
): { row: number; col: number }[] {
  if (!player) return [];

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    const cells: { row: number; col: number }[] = [{ row, col }];

    // Positive direction
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (
        newRow < 0 ||
        newRow >= board.length ||
        newCol < 0 ||
        newCol >= board[0].length ||
        board[newRow][newCol] !== player
      ) {
        break;
      }
      cells.push({ row: newRow, col: newCol });
    }

    // Negative direction
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (
        newRow < 0 ||
        newRow >= board.length ||
        newCol < 0 ||
        newCol >= board[0].length ||
        board[newRow][newCol] !== player
      ) {
        break;
      }
      cells.push({ row: newRow, col: newCol });
    }

    if (cells.length >= 5) {
      return cells;
    }
  }

  return [];
}
