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
  notes?: number[];
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
  notes = [],
  onClick,
}: CellProps) {
  const [animate, setAnimate] = useState<"pop" | "shake" | null>(null);
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;
  const isLeftEdge = col === 0 || col === 3 || col === 6;
  const isTopEdge = row === 0 || row === 3 || row === 6;

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
        "sudoku-cell relative flex items-center justify-center font-medium touch-action-manipulation",
        "border-[0.5px] border-border/50 transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "active:scale-95",
        isRightBorder && "border-r-[3px] border-r-foreground/60",
        isBottomBorder && "border-b-[3px] border-b-foreground/60",
        isLeftEdge && "border-l-[3px] border-l-foreground/60",
        isTopEdge && "border-t-[3px] border-t-foreground/60",
        isSelected && "bg-[hsl(var(--cell-selected))] ring-2 ring-primary/80 ring-inset shadow-lg shadow-primary/20",
        isHighlighted && !isSelected && "bg-[hsl(var(--cell-highlighted))]",
        isSameValue && !isSelected && !isHighlighted && "bg-primary/15 text-primary",
        isConflict && "bg-[hsl(var(--cell-conflict))] text-red-400 font-bold",
        isInitial
          ? "bg-[hsl(var(--cell-initial))] text-foreground/90 cursor-default font-bold"
          : "bg-card hover:bg-muted/60 cursor-pointer",
        !isInitial && !isConflict && value !== 0 && "text-primary font-semibold",
        animate === "pop" && "animate-pop",
        animate === "shake" && "animate-shake"
      )}
    >
      {value !== 0 ? (
        value
      ) : notes.length > 0 ? (
        <span className="absolute top-0.5 left-1 text-[10px] sm:text-xs text-muted-foreground font-normal">
          {notes[0]}
        </span>
      ) : null}
    </button>
  );
}
