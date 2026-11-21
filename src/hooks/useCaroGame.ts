"use client";

import { useState, useCallback } from "react";
import {
  Board,
  CellValue,
  createEmptyBoard,
  findWinningCells,
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
  loadBoard: (board: Board, turn: CellValue, lastMove?: { row: number; col: number } | null) => void;
  applyServerMove: (board: Board, turn: CellValue, row: number, col: number, symbol: CellValue) => void;
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

      const cells = findWinningCells(newBoard, row, col, player);
      if (cells.length > 0) {
        setWinner(player);
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

  const loadBoard = useCallback((nextBoard: Board, turn: CellValue, nextLastMove?: { row: number; col: number } | null) => {
    setBoard(nextBoard);
    setCurrentTurn(turn);
    if (nextLastMove !== undefined) {
      setLastMove(nextLastMove);
      if (nextLastMove) {
        const piece = nextBoard[nextLastMove.row]?.[nextLastMove.col] ?? null;
        const cells = piece ? findWinningCells(nextBoard, nextLastMove.row, nextLastMove.col, piece) : [];
        setWinningCells(cells);
        setWinner(cells.length > 0 ? piece : null);
      } else {
        setWinningCells([]);
        setWinner(null);
      }
    }
  }, []);

  // Trạng thái server gửi về là chuẩn, ghi đè cả nước đi hiển thị trước ở máy này
  const applyServerMove = useCallback(
    (nextBoard: Board, turn: CellValue, row: number, col: number, symbol: CellValue) => {
      setBoard(nextBoard);
      setCurrentTurn(turn);
      setLastMove({ row, col });
      const cells = symbol ? findWinningCells(nextBoard, row, col, symbol) : [];
      if (cells.length > 0) {
        setWinner(symbol);
        setWinningCells(cells);
      }
    },
    []
  );

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
    applyServerMove,
    setLastMove,
  };
}
