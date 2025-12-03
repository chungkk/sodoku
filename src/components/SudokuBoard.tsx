"use client";

import { memo, useCallback, useMemo } from "react";
import { Cell } from "./Cell";
import { findConflicts } from "@/lib/sudoku";

interface SudokuBoardProps {
  puzzle: number[][];
  userInput: (number | null)[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  isPaused?: boolean;
}

const SudokuBoard = memo(function SudokuBoard({
  puzzle,
  userInput,
  notes,
  selectedCell,
  onCellClick,
  isPaused = false,
}: SudokuBoardProps) {
  const getCellValue = useCallback(
    (row: number, col: number): number | null => {
      if (puzzle[row][col] !== 0) return puzzle[row][col];
      return userInput[row][col];
    },
    [puzzle, userInput]
  );

  const selectedValue = useMemo(() => {
    if (!selectedCell) return null;
    return getCellValue(selectedCell[0], selectedCell[1]);
  }, [selectedCell, getCellValue]);

  const isHighlighted = useCallback(
    (row: number, col: number): boolean => {
      if (!selectedCell) return false;
      const [selRow, selCol] = selectedCell;

      if (row === selRow || col === selCol) return true;

      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      const selBoxRow = Math.floor(selRow / 3);
      const selBoxCol = Math.floor(selCol / 3);

      return boxRow === selBoxRow && boxCol === selBoxCol;
    },
    [selectedCell]
  );

  const isSameNumber = useCallback(
    (row: number, col: number): boolean => {
      if (!selectedValue) return false;
      const cellValue = getCellValue(row, col);
      return cellValue === selectedValue;
    },
    [selectedValue, getCellValue]
  );

  const hasConflict = useCallback(
    (row: number, col: number): boolean => {
      const value = getCellValue(row, col);
      if (!value || puzzle[row][col] !== 0) return false;

      const currentGrid = puzzle.map((puzzleRow, r) =>
        puzzleRow.map((cell, c) => (cell !== 0 ? cell : userInput[r][c] || 0))
      );

      const conflicts = findConflicts(currentGrid, row, col, value);
      return conflicts.length > 0;
    },
    [puzzle, userInput, getCellValue]
  );

  if (isPaused) {
    return (
      <div className="relative">
        <div className="grid-sudoku rounded-lg overflow-hidden opacity-20 blur-sm">
          {Array(81)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="w-full aspect-square bg-gray-200"
              />
            ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-xl font-semibold text-gray-800">Tạm dừng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-sudoku rounded-lg overflow-hidden">
      {Array(9)
        .fill(null)
        .map((_, row) =>
          Array(9)
            .fill(null)
            .map((_, col) => {
              const value = getCellValue(row, col);
              const isGiven = puzzle[row][col] !== 0;
              const isSelected =
                selectedCell !== null &&
                selectedCell[0] === row &&
                selectedCell[1] === col;

              return (
                <Cell
                  key={`${row}-${col}`}
                  value={value}
                  notes={notes[row][col]}
                  isGiven={isGiven}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted(row, col)}
                  isSameNumber={isSameNumber(row, col)}
                  hasConflict={hasConflict(row, col)}
                  onClick={() => onCellClick(row, col)}
                  row={row}
                  col={col}
                />
              );
            })
        )}
    </div>
  );
});

export { SudokuBoard };
export type { SudokuBoardProps };
