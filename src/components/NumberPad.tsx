"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  onToggleNoteMode: () => void;
  isNoteMode: boolean;
  selectedNumber: number | null;
  disabled?: boolean;
}

const NumberPad = memo(function NumberPad({
  onNumberClick,
  onClear,
  onToggleNoteMode,
  isNoteMode,
  selectedNumber,
  disabled = false,
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
        {numbers.map((num) => (
          <motion.button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`number-pad-btn ${
              selectedNumber === num ? "number-pad-btn-active" : ""
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={`Number ${num}`}
          >
            {num}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <motion.button
          onClick={onClear}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`
            flex items-center justify-center gap-2
            px-4 py-2 rounded-xl font-medium
            bg-gray-100 text-gray-700
            hover:bg-gray-200 transition-colors
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          aria-label="Clear cell"
        >
          <span>🗑️</span>
          <span className="hidden sm:inline">Xóa</span>
        </motion.button>

        <motion.button
          onClick={onToggleNoteMode}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`
            flex items-center justify-center gap-2
            px-4 py-2 rounded-xl font-medium
            transition-colors
            ${
              isNoteMode
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          aria-label={isNoteMode ? "Exit note mode" : "Enter note mode"}
        >
          <span>✏️</span>
          <span className="hidden sm:inline">Nháp {isNoteMode ? "(Bật)" : ""}</span>
        </motion.button>
      </div>
    </div>
  );
});

export { NumberPad };
export type { NumberPadProps };
