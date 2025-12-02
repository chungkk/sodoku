"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface CellProps {
  value: number | null;
  notes: Set<number>;
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
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
  hasConflict,
  onClick,
  row,
  col,
}: CellProps) {
  const isBoxBorderRight = (col + 1) % 3 === 0 && col < 8;
  const isBoxBorderBottom = (row + 1) % 3 === 0 && row < 8;

  const getCellClassName = () => {
    const classes = ["sudoku-cell", "w-full", "aspect-square", "bg-white"];

    if (isGiven) {
      classes.push("sudoku-cell-given");
    } else if (value) {
      classes.push("sudoku-cell-user");
    }

    if (isSelected) {
      classes.push("sudoku-cell-selected");
    } else if (isHighlighted) {
      classes.push("sudoku-cell-highlighted");
    }

    if (hasConflict && !isGiven) {
      classes.push("sudoku-cell-conflict");
    }

    if (isBoxBorderRight) {
      classes.push("border-r-2 border-r-gray-400");
    }

    if (isBoxBorderBottom) {
      classes.push("border-b-2 border-b-gray-400");
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
                ? "text-gray-700 bg-yellow-200 rounded-sm" 
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
    <motion.button
      onClick={onClick}
      className={getCellClassName()}
      whileTap={{ scale: 0.95 }}
      animate={
        hasConflict && !isGiven
          ? {
              backgroundColor: ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.2)"],
            }
          : {}
      }
      transition={{ duration: 0.3 }}
      disabled={isGiven}
      aria-label={`Cell ${row + 1}, ${col + 1}${value ? `, value ${value}` : ", empty"}`}
    >
      {value ? (
        <motion.span
          key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      ) : (
        renderNotes()
      )}
    </motion.button>
  );
});

export { Cell };
export type { CellProps };
