"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface CellProps {
  value: number | null;
  notes: Set<number>;
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  hasConflict: boolean;
  onClick: () => void;
  row: number;
  col: number;
}

const Cell = memo(function Cell({
  value,
  notes,
  isGiven,
  isSelected,
  isHighlighted,
  isSameNumber,
  hasConflict,
  onClick,
  row,
  col,
}: CellProps) {
  const isBoxBorderRight = (col + 1) % 3 === 0 && col < 8;
  const isBoxBorderBottom = (row + 1) % 3 === 0 && row < 8;
  const isBoxBorderLeft = col % 3 === 0;
  const isBoxBorderTop = row % 3 === 0;

  const getCellClassName = () => {
    const classes = ["sudoku-cell", "w-full", "aspect-square"];

    if (isGiven) {
      classes.push("sudoku-cell-given");
    } else if (value) {
      classes.push("sudoku-cell-user");
    }

    if (hasConflict && !isGiven) {
      classes.push("sudoku-cell-conflict");
    } else if (isSelected) {
      classes.push("sudoku-cell-selected");
    } else if (isSameNumber && value) {
      classes.push("sudoku-cell-same-number");
    } else if (isHighlighted) {
      classes.push("sudoku-cell-highlighted");
    }

    if (isBoxBorderRight) {
      classes.push("!border-r-2 !border-r-[#1e3a5f]");
    }
    if (isBoxBorderBottom) {
      classes.push("!border-b-2 !border-b-[#1e3a5f]");
    }
    if (isBoxBorderLeft && col !== 0) {
      classes.push("!border-l-2 !border-l-[#1e3a5f]");
    }
    if (isBoxBorderTop && row !== 0) {
      classes.push("!border-t-2 !border-t-[#1e3a5f]");
    }

    return classes.join(" ");
  };

  const renderNotes = () => {
    if (value || notes.size === 0) return null;

    return (
      <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <span
            key={num}
            className={`
              flex items-center justify-center
              text-[8px] sm:text-[10px] font-medium leading-none
              ${notes.has(num) 
                ? "text-gray-600" 
                : "text-transparent"
              }
            `}
          >
            {num}
          </span>
        ))}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={getCellClassName()}
      aria-label={`Cell ${row + 1}, ${col + 1}${value ? `, value ${value}` : ", empty"}`}
    >
      {value ? (
        <motion.span
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      ) : (
        renderNotes()
      )}
    </button>
  );
});

export { Cell };
export type { CellProps };
