"use client";

import { memo } from "react";

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  selectedNumber: number | null;
  disabled?: boolean;
}

const NumberPad = memo(function NumberPad({
  onNumberClick,
  selectedNumber,
  disabled = false,
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex items-center justify-between px-2">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          className={`
            number-pad-btn
            w-9 h-12 sm:w-10 sm:h-14
            ${selectedNumber === num ? "number-pad-btn-active" : ""}
            ${disabled ? "opacity-40 cursor-not-allowed" : "active:scale-95"}
          `}
        >
          {num}
        </button>
      ))}
    </div>
  );
});

export { NumberPad };
export type { NumberPadProps };
