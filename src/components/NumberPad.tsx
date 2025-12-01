"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      {/* Number grid - 3x3 on mobile, 9x1 on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            disabled={disabled}
            onClick={() => onNumberClick(num)}
            className={cn(
              "font-retro text-xl sm:text-2xl touch-action-manipulation",
              "h-12 w-full sm:h-14 sm:w-14 p-0",
              "bg-card hover:bg-primary hover:text-primary-foreground",
              "border-2 border-border hover:border-primary",
              "active:translate-y-0.5 transition-all duration-100",
              "retro-btn"
            )}
          >
            {num}
          </Button>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant={isNotesMode ? "default" : "outline"}
          onClick={() => onInputModeChange?.(isNotesMode ? "fill" : "notes")}
          className={cn(
            "flex-1 h-11 font-retro text-base touch-action-manipulation",
            "border-2 retro-btn",
            isNotesMode 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-card border-border hover:bg-muted"
          )}
        >
          {isNotesMode ? "[ NHÁP ]" : "[ ĐIỀN ]"}
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={onClear}
          className={cn(
            "flex-1 h-11 font-retro text-base touch-action-manipulation",
            "border-2 border-border bg-card hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
            "retro-btn"
          )}
        >
          [ XÓA ]
        </Button>
      </div>
    </div>
  );
}
