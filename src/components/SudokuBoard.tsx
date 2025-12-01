"use client";

import { useCallback, useEffect, useRef } from "react";
import { Cell } from "./Cell";
import { cn } from "@/lib/utils";

interface SudokuBoardProps {
  board: number[][];
  initialBoard: number[][];
  selectedCell: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  notes?: number[][][];
  onCellClick: (row: number, col: number) => void;
  onNumberInput: (value: number) => void;
  onClear: () => void;
  className?: string;
}

export function SudokuBoard({
  board,
  initialBoard,
  selectedCell,
  conflicts,
  notes,
  onCellClick,
  onNumberInput,
  onClear,
  className,
}: SudokuBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  const isHighlighted = useCallback(
    (row: number, col: number): boolean => {
      if (!selectedCell) return false;
      const { row: selRow, col: selCol } = selectedCell;
      
      if (row === selRow || col === selCol) return true;
      
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      const selBoxRow = Math.floor(selRow / 3);
      const selBoxCol = Math.floor(selCol / 3);
      
      return boxRow === selBoxRow && boxCol === selBoxCol;
    },
    [selectedCell]
  );

  const isConflict = useCallback(
    (row: number, col: number): boolean => {
      return conflicts.some((c) => c.row === row && c.col === col);
    },
    [conflicts]
  );

  const isSameValue = useCallback(
    (row: number, col: number): boolean => {
      if (!selectedCell) return false;
      const selectedValue = board[selectedCell.row][selectedCell.col];
      if (selectedValue === 0) return false;
      return board[row][col] === selectedValue;
    },
    [selectedCell, board]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (row > 0) onCellClick(row - 1, col);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (row < 8) onCellClick(row + 1, col);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (col > 0) onCellClick(row, col - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (col < 8) onCellClick(row, col + 1);
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          onNumberInput(parseInt(e.key, 10));
          break;
        case "Backspace":
        case "Delete":
        case "0":
          e.preventDefault();
          onClear();
          break;
      }
    },
    [selectedCell, onCellClick, onNumberInput, onClear]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={boardRef}
      className={cn(
        "inline-grid grid-cols-9 rounded-xl overflow-hidden shadow-lg bg-card",
        className
      )}
      tabIndex={0}
    >
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={value}
            row={rowIndex}
            col={colIndex}
            isInitial={initialBoard[rowIndex][colIndex] !== 0}
            isSelected={
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex
            }
            isHighlighted={isHighlighted(rowIndex, colIndex)}
            isConflict={isConflict(rowIndex, colIndex)}
            isSameValue={isSameValue(rowIndex, colIndex)}
            notes={notes?.[rowIndex]?.[colIndex]}
            onClick={onCellClick}
          />
        ))
      )}
    </div>
  );
}
