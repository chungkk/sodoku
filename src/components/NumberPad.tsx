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
    <div className="number-pad-container">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          className={`
            number-pad-btn
            ${selectedNumber === num ? "number-pad-btn-active" : ""}
            ${disabled ? "number-pad-btn-disabled" : ""}
          `}
        >
          <span className="number-pad-btn-text">{num}</span>
        </button>
      ))}
    </div>
  );
});

export { NumberPad };
export type { NumberPadProps };
