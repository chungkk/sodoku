"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eraser, Pencil, PenLine } from "lucide-react";

type InputMode = "fill" | "notes";

interface NumberPadProps {
  onNumberClick: (value: number) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
  inputMode?: InputMode;
  onInputModeChange?: (mode: InputMode) => void;
}

export function NumberPad({
  onNumberClick,
  onClear,
  disabled = false,
  className,
  inputMode = "fill",
  onInputModeChange,
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const isNotesMode = inputMode === "notes";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            disabled={disabled}
            onClick={() => onNumberClick(num)}
            className={cn(
              "text-xl sm:text-2xl font-bold touch-action-manipulation",
              "h-12 w-12 sm:h-14 sm:w-14 p-0",
              "active:scale-95 transition-all duration-200",
              "bg-card hover:bg-primary/20 hover:border-primary/60 hover:text-primary",
              "border-border/50"
            )}
          >
            {num}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant={isNotesMode ? "default" : "outline"}
          onClick={() => onInputModeChange?.(isNotesMode ? "fill" : "notes")}
          className={cn(
            "flex-1 h-12 text-base font-medium touch-action-manipulation",
            "active:scale-[0.98] transition-all",
            isNotesMode && "bg-primary text-primary-foreground"
          )}
        >
          {isNotesMode ? (
            <Pencil className="w-5 h-5 mr-2" />
          ) : (
            <PenLine className="w-5 h-5 mr-2" />
          )}
          {isNotesMode ? "Nháp" : "Điền"}
        </Button>
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={onClear}
          className={cn(
            "flex-1 h-12 text-base font-medium touch-action-manipulation",
            "active:scale-[0.98] transition-transform"
          )}
        >
          <Eraser className="w-5 h-5 mr-2" />
          Xóa
        </Button>
      </div>
    </div>
  );
}
