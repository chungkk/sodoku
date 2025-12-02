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
  const row1 = [1, 2, 3, 4, 5];
  const row2 = [6, 7, 8, 9];

  const NumberButton = ({ num }: { num: number }) => (
    <motion.button
      onClick={() => onNumberClick(num)}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        h-12 sm:h-14 rounded-xl text-xl sm:text-2xl font-bold
        transition-all duration-150
        ${selectedNumber === num 
          ? "bg-primary-500 text-white shadow-md" 
          : "bg-primary-50 text-primary-700 hover:bg-primary-100"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {num}
    </motion.button>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: 1-5 */}
      <div className="grid grid-cols-5 gap-2">
        {row1.map((num) => (
          <NumberButton key={num} num={num} />
        ))}
      </div>

      {/* Row 2: 6-9 + Delete */}
      <div className="grid grid-cols-5 gap-2">
        {row2.map((num) => (
          <NumberButton key={num} num={num} />
        ))}
        <motion.button
          onClick={onClear}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          className={`
            h-12 sm:h-14 rounded-xl text-xl
            bg-gray-100 text-gray-600 hover:bg-gray-200
            transition-all duration-150
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          ⌫
        </motion.button>
      </div>

      {/* Note mode toggle - compact on mobile */}
      <motion.button
        onClick={onToggleNoteMode}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          flex items-center justify-center gap-2
          h-10 rounded-xl font-medium text-sm
          transition-colors
          ${isNoteMode
            ? "bg-primary-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span>✏️</span>
        <span>Nháp {isNoteMode ? "(Bật)" : "(Tắt)"}</span>
      </motion.button>
    </div>
  );
});

export { NumberPad };
export type { NumberPadProps };
