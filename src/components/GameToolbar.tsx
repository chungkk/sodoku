"use client";

import { memo, type ReactNode } from "react";
import { PencilIcon, UndoIcon } from "@/components/icons";

interface GameToolbarProps {
  onUndo: () => void;
  onToggleNotes: () => void;
  isNotesMode: boolean;
  canUndo: boolean;
  disabled?: boolean;
  /** Hành động riêng của màn: bỏ cuộc hoặc ván mới */
  action?: ReactNode;
}

export const toolButtonClass =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-[3px] border-ink bg-milk px-1.5 text-[0.95rem] font-bold leading-none max-[359px]:[&>svg]:hidden transition-colors hover:bg-lemon-pale disabled:cursor-not-allowed disabled:opacity-45 [&>svg]:shrink-0 [&>svg]:text-lg";

const GameToolbar = memo(function GameToolbar({ onUndo, onToggleNotes, isNotesMode, canUndo, disabled = false, action }: GameToolbarProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onUndo} disabled={disabled || !canUndo} className={toolButtonClass}>
        <UndoIcon /> Hoàn tác
      </button>
      <button
        onClick={onToggleNotes}
        disabled={disabled}
        aria-pressed={isNotesMode}
        className={`${toolButtonClass} ${isNotesMode ? "!bg-lemon" : ""}`}
      >
        <PencilIcon /> Ghi chú
      </button>
      {action}
    </div>
  );
});

export { GameToolbar };
export type { GameToolbarProps };
