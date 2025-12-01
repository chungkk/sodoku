"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface CellProps {
  value: number;
  row: number;
  col: number;
  isInitial: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isConflict: boolean;
  isSameValue?: boolean;
  onClick: (row: number, col: number) => void;
}

export function Cell({
  value,
  row,
  col,
  isInitial,
  isSelected,
  isHighlighted,
  isConflict,
  isSameValue,
  onClick,
}: CellProps) {
  const [animate, setAnimate] = useState<"pop" | "shake" | null>(null);
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;

  useEffect(() => {
    if (isConflict) {
      setAnimate("shake");
      const timer = setTimeout(() => setAnimate(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isConflict]);

  useEffect(() => {
    if (value !== 0 && !isInitial && !isConflict) {
      setAnimate("pop");
      const timer = setTimeout(() => setAnimate(null), 200);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={() => onClick(row, col)}
      disabled={isInitial}
      className={cn(
        "sudoku-cell flex items-center justify-center font-medium touch-action-manipulation",
        "border border-border/50 transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        "active:scale-95",
        isRightBorder && "border-r-2 border-r-foreground/40",
        isBottomBorder && "border-b-2 border-b-foreground/40",
        isSelected && "bg-[hsl(var(--cell-selected))] ring-2 ring-primary ring-inset shadow-inner",
        isHighlighted && !isSelected && "bg-[hsl(var(--cell-highlighted))]",
        isSameValue && !isSelected && !isHighlighted && "bg-primary/10",
        isConflict && "bg-[hsl(var(--cell-conflict))] text-destructive font-bold",
        isInitial
          ? "bg-[hsl(var(--cell-initial))] text-foreground cursor-default font-bold"
          : "bg-background hover:bg-muted/50 cursor-pointer",
        !isInitial && !isConflict && value !== 0 && "text-primary font-semibold",
        animate === "pop" && "animate-pop",
        animate === "shake" && "animate-shake"
      )}
    >
      {value !== 0 ? value : ""}
    </button>
  );
}
