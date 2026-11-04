"use client";

import { memo } from "react";
import { EraseIcon } from "@/components/icons";

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onErase: () => void;
  selectedNumber: number | null;
  disabled?: boolean;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const NumberPad = memo(function NumberPad({ onNumberClick, onErase, selectedNumber, disabled = false }: NumberPadProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-3 lg:gap-2">
      {NUMBERS.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          aria-label={`Số ${num}`}
          className={`number-candy ${selectedNumber === num ? "number-candy-active" : ""}`}
        >
          {num}
        </button>
      ))}
      <button onClick={onErase} disabled={disabled} aria-label="Xóa ô đang chọn" className="number-candy !bg-gum lg:col-start-2">
        <EraseIcon />
      </button>
    </div>
  );
});

export { NumberPad };
export type { NumberPadProps };
