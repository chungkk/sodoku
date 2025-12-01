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
      const timer = setTimeout(() => setAnimate(null), 250);
      return () => clearTimeout(timer);
    }
  }, [isConflict]);

  useEffect(() => {
    if (value !== 0 && !isInitial && !isConflict) {
      setAnimate("pop");
      const timer = setTimeout(() => setAnimate(null), 150);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={() => onClick(row, col)}
      disabled={isInitial}
      className={cn(
        "sudoku-cell font-retro relative flex items-center justify-center touch-action-manipulation",
        "border border-border/50 transition-all duration-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        // Box borders (thicker)
        isRightBorder && "border-r-[3px] border-r-border",
        isBottomBorder && "border-b-[3px] border-b-border",
        isLeftEdge && "border-l-[3px] border-l-border",
        isTopEdge && "border-t-[3px] border-t-border",
        // States
        isSelected && "bg-[hsl(var(--cell-selected))] ring-2 ring-primary z-10",
        isHighlighted && !isSelected && "bg-[hsl(var(--cell-highlighted))]",
        isSameValue && !isSelected && !isHighlighted && "bg-primary/20 text-primary",
        isConflict && "bg-[hsl(var(--cell-conflict))] text-destructive",
        // Initial vs editable
        isInitial
          ? "bg-[hsl(var(--cell-initial))] text-foreground cursor-default font-bold"
          : "bg-card hover:bg-muted cursor-pointer",
        !isInitial && !isConflict && value !== 0 && "text-primary font-bold",
        // Animations
        animate === "pop" && "animate-pop",
        animate === "shake" && "animate-shake"
      )}
    >
      {value !== 0 ? (
        value
      ) : notes.length > 0 ? (
        <span className="absolute top-0 left-0.5 text-[9px] text-muted-foreground">
          {notes[0]}
        </span>
      ) : null}
    </button>
  );
}
