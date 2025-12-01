"use client";

import { useState, useCallback } from "react";
import { boardToGrid, gridToBoard } from "@/lib/sudoku";

interface UseGameOptions {
  initialBoard: string;
  sessionId: string;
  roomCode: string;
}

interface UseGameReturn {
  board: number[][];
  initialGrid: number[][];
  selectedCell: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  mistakesCount: number;
  selectCell: (row: number, col: number) => void;
  inputNumber: (value: number) => Promise<void>;
  clearCell: () => Promise<void>;
  isComplete: boolean;
}

export function useGame({
  initialBoard,
  sessionId,
  roomCode,
}: UseGameOptions): UseGameReturn {
  const initialGrid = boardToGrid(initialBoard);
  const [board, setBoard] = useState<number[][]>(() => boardToGrid(initialBoard));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [conflicts, setConflicts] = useState<{ row: number; col: number }[]>([]);
  const [mistakesCount, setMistakesCount] = useState(0);

  const selectCell = useCallback((row: number, col: number) => {
    if (initialGrid[row][col] !== 0) {
      setSelectedCell(null);
      return;
    }
    setSelectedCell({ row, col });
    setConflicts([]);
  }, [initialGrid]);

  const inputNumber = useCallback(
    async (value: number) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;

      if (initialGrid[row][col] !== 0) return;

      try {
        const response = await fetch(`/api/games/${roomCode}/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
          body: JSON.stringify({ row, col, value }),
        });

        const data = await response.json();

        if (data.isCorrect) {
          setBoard((prev) => {
            const newBoard = prev.map((r) => [...r]);
            newBoard[row][col] = value;
            return newBoard;
          });
          setConflicts([]);

          const newBoard = board.map((r) => [...r]);
          newBoard[row][col] = value;
          await fetch(`/api/games/${roomCode}/progress`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "X-Session-ID": sessionId,
            },
            body: JSON.stringify({ currentBoard: gridToBoard(newBoard) }),
          });
        } else {
          setConflicts(data.conflicts || []);
          setMistakesCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Validation error:", error);
      }
    },
    [selectedCell, initialGrid, sessionId, roomCode, board]
  );

  const clearCell = useCallback(async () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (initialGrid[row][col] !== 0) return;

    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = 0;
      return newBoard;
    });
    setConflicts([]);

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = 0;
    
    try {
      await fetch(`/api/games/${roomCode}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
        },
        body: JSON.stringify({ currentBoard: gridToBoard(newBoard) }),
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  }, [selectedCell, initialGrid, sessionId, roomCode, board]);

  const isComplete = board.every((row) => row.every((cell) => cell !== 0));

  return {
    board,
    initialGrid,
    selectedCell,
    conflicts,
    mistakesCount,
    selectCell,
    inputNumber,
    clearCell,
    isComplete,
  };
}
