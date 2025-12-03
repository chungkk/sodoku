"use client";

import { memo } from "react";

interface GameToolbarProps {
  onUndo: () => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  isNotesMode: boolean;
  hintsRemaining: number;
  canUndo: boolean;
  disabled?: boolean;
}

const GameToolbar = memo(function GameToolbar({
  onUndo,
  onErase,
  onToggleNotes,
  onHint,
  isNotesMode,
  hintsRemaining,
  canUndo,
  disabled = false,
}: GameToolbarProps) {
  const buttonClass = "flex items-center justify-center w-12 h-10 text-gray-500 touch-manipulation";
  const iconClass = "w-6 h-6";

  return (
    <div className="flex items-center justify-center gap-6 py-1">
      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className={`${buttonClass} ${disabled || !canUndo ? "opacity-30" : ""}`}
        aria-label="Hoàn tác"
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4m-4 4l4 4" />
        </svg>
      </button>

      {/* Erase */}
      <button
        onClick={onErase}
        disabled={disabled}
        className={`${buttonClass} ${disabled ? "opacity-30" : ""}`}
        aria-label="Xóa"
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Notes Toggle */}
      <button
        onClick={onToggleNotes}
        disabled={disabled}
        className={`${buttonClass} ${isNotesMode ? "text-primary-500" : ""} ${disabled ? "opacity-30" : ""}`}
        aria-label={isNotesMode ? "Tắt ghi chú" : "Bật ghi chú"}
      >
        <div className="relative">
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {!isNotesMode && (
            <span className="absolute -bottom-0.5 -right-1.5 bg-gray-400 text-white text-[7px] px-0.5 rounded">
              OFF
            </span>
          )}
        </div>
      </button>

      {/* Hint */}
      <button
        onClick={onHint}
        disabled={disabled || hintsRemaining === 0}
        className={`${buttonClass} relative ${disabled || hintsRemaining === 0 ? "opacity-30" : ""}`}
        aria-label={`Gợi ý (còn ${hintsRemaining})`}
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {hintsRemaining > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
            {hintsRemaining}
          </span>
        )}
      </button>
    </div>
  );
});

export { GameToolbar };
export type { GameToolbarProps };
