"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Board, CellValue } from "@/lib/caro";
import { BOARD_SIZE } from "@/lib/caro";

interface CaroBoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
  lastMove?: { row: number; col: number } | null;
  winningCells?: { row: number; col: number }[];
}

export const CaroBoard = memo(function CaroBoard({
  board,
  onCellClick,
  disabled = false,
  lastMove,
  winningCells = [],
}: CaroBoardProps) {
  const isWinningCell = (row: number, col: number) => {
    return winningCells.some((cell) => cell.row === row && cell.col === col);
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col;
  };

  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-2 md:p-4">
      {/* Grid container với background lines */}
      <div className="relative" style={{ aspectRatio: "1" }}>
        {/* Horizontal lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: BOARD_SIZE + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 bg-amber-900/30"
              style={{
                top: `${(i / BOARD_SIZE) * 100}%`,
                height: "1px",
              }}
            />
          ))}
        </div>
        
        {/* Vertical lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: BOARD_SIZE + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 bg-amber-900/30"
              style={{
                left: `${(i / BOARD_SIZE) * 100}%`,
                width: "1px",
              }}
            />
          ))}
        </div>

        {/* Game board */}
        <div
          className="relative grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            height: "100%",
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isWinning = isWinningCell(rowIndex, colIndex);
              const isLast = isLastMove(rowIndex, colIndex);

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  disabled={disabled || cell !== null}
                  className={`
                    relative aspect-square
                    flex items-center justify-center
                    transition-colors
                    ${!disabled && cell === null ? "hover:bg-amber-100/50 cursor-pointer" : ""}
                    ${disabled || cell !== null ? "cursor-not-allowed" : ""}
                    ${isWinning ? "bg-green-200/70" : ""}
                    ${isLast ? "bg-blue-100/50" : ""}
                  `}
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 20px)",
                  }}
                >
                  {cell && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className={`
                        font-bold select-none
                        ${cell === "X" ? "text-blue-600" : "text-red-600"}
                        ${isWinning ? "text-green-700" : ""}
                      `}
                      style={{ fontSize: "1.5em" }}
                    >
                      {cell}
                    </motion.div>
                  )}

                  {!cell && !disabled && (
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
