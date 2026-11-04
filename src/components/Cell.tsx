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

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
  const classes = ["sudoku-cell"];
  if (col === 8) classes.push("!border-r-0");
  if (row === 8) classes.push("!border-b-0");
  const isTinted = (Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 1;

  if (isSelected) classes.push("sudoku-cell-selected");
  else if (hasConflict && !isGiven) classes.push("sudoku-cell-conflict-bg");
  else if (isSameNumber && value) classes.push("sudoku-cell-same-number");
  else if (isHighlighted) classes.push("sudoku-cell-highlighted");
  else if (isTinted) classes.push("sudoku-cell-tint");

  return (
    <button
      onClick={onClick}
      className={classes.join(" ")}
      aria-label={`Ô hàng ${row + 1}, cột ${col + 1}${value ? `, số ${value}` : ", trống"}${isGiven ? ", số đề bài" : ""}${hasConflict ? ", bị trùng" : ""}`}
    >
      {value ? (
        isGiven ? (
          value
        ) : (
          <motion.span
            key={value}
            className={`sudoku-candy ${hasConflict ? "sudoku-candy-conflict" : ""}`}
            initial={{ y: "-70%", scale: 0.6 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 620, damping: 17 }}
          >
            {value}
          </motion.span>
        )
      ) : notes.size > 0 ? (
        <span className="sudoku-notes">
          {DIGITS.map((num) => (
            <span key={num} className="flex items-center justify-center">
              {notes.has(num) ? num : ""}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
});

export { Cell };
export type { CellProps };
