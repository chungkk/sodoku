"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MascotSay } from "@/components/candy";
import type { MascotMood } from "@/components/Mascot";
import { GameToolbar } from "@/components/GameToolbar";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { NumberPad } from "@/components/NumberPad";
import { SudokuBoard } from "@/components/SudokuBoard";
import { formatTime } from "@/components/Timer";
import type { useGame } from "@/hooks/useGame";

interface SudokuStageProps {
  game: ReturnType<typeof useGame>;
  seconds: number;
  /** Bàn đang bị che và khoá */
  locked: boolean;
  lockedLabel?: string;
  /** Ván đã xong: vẫn hiện bàn thật nhưng không chạm được */
  frozen?: boolean;
  /** Ẩn nhãn trên máy tính khi độ khó đã có bộ chọn riêng */
  badgeMobileOnly?: boolean;
  /** Hiện biểu tượng chạy tiếp thay vì tạm dừng */
  paused: boolean;
  pauseDisabled?: boolean;
  onPauseToggle: () => void;
  onNumber: (num: number) => void;
  onClear: () => void;
  onUndo: () => void;
  say: ReactNode;
  mood?: MascotMood;
  /** Mã phòng hoặc độ khó */
  badge: ReactNode;
  progress?: ReactNode;
  action: ReactNode;
}

/** Bố cục chung của Sudoku đối kháng và luyện tập: một cột trên điện thoại, hai cột trên máy tính. */
export function SudokuStage({
  game,
  seconds,
  locked,
  lockedLabel,
  frozen = false,
  badgeMobileOnly = false,
  paused,
  pauseDisabled = false,
  onPauseToggle,
  onNumber,
  onClear,
  onUndo,
  say,
  mood = "happy",
  badge,
  progress,
  action,
}: SudokuStageProps) {
  const { puzzle, userInput, selectedCell } = game;
  const selectedValue = selectedCell
    ? puzzle[selectedCell[0]][selectedCell[1]] !== 0
      ? puzzle[selectedCell[0]][selectedCell[1]]
      : userInput[selectedCell[0]][selectedCell[1]]
    : null;
  // Mắt tắc kè nhìn theo ô đang chọn
  const look = selectedCell ? { x: (selectedCell[1] - 4) / 4, y: (selectedCell[0] - 4) / 4 } : null;

  // Tắc kè giật mình một thoáng khi vừa thả số trùng
  const [startled, setStartled] = useState(false);
  const lastErrors = useRef(game.errors);
  useEffect(() => {
    const isNewError = game.errors > lastErrors.current;
    lastErrors.current = game.errors;
    if (!isNewError) return;
    setStartled(true);
    const timer = setTimeout(() => setStartled(false), 900);
    return () => clearTimeout(timer);
  }, [game.errors]);

  return (
    <div className="sudoku-stage">
      <div className="sudoku-stage-say min-w-0">
        <MascotSay mood={startled ? "wow" : mood} look={look} className="w-full" mascotClassName="w-14 [@media(max-height:720px)]:w-10 [@media(min-height:780px)]:w-20 lg:w-24">
          {say}
        </MascotSay>
      </div>

      <div className="sudoku-stage-info flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`min-w-0 truncate rounded-full border-[3px] border-ink bg-milk px-3 py-0.5 font-bold ${badgeMobileOnly ? "lg:hidden" : ""}`}>{badge}</span>
          <span className="whitespace-nowrap rounded-full border-[3px] border-ink bg-milk px-3 py-0.5 font-bold tabular-nums">{game.errors} lỗi</span>
          <span className="flex items-center gap-1 rounded-full border-[3px] border-ink bg-milk py-0.5 pl-3 pr-0.5 font-bold tabular-nums">
            {formatTime(seconds)}
            <button
              onClick={onPauseToggle}
              disabled={pauseDisabled}
              aria-label={paused ? "Chạy tiếp" : "Tạm dừng"}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm text-milk transition-opacity disabled:opacity-40"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
          </span>
        </div>
        {progress}
      </div>

      <div className={`sudoku-stage-board ${frozen ? "pointer-events-none" : ""}`}>
        <SudokuBoard
          puzzle={puzzle}
          userInput={userInput}
          notes={game.notes}
          selectedCell={selectedCell}
          onCellClick={game.selectCell}
          isPaused={locked && !frozen}
          pausedLabel={lockedLabel}
        />
      </div>

      <div className="sudoku-stage-tools">
        <GameToolbar
          onUndo={onUndo}
          onToggleNotes={game.toggleMode}
          isNotesMode={game.mode === "note"}
          canUndo={game.canUndo}
          disabled={locked}
          action={action}
        />
      </div>

      <div className="sudoku-stage-pad">
        <NumberPad onNumberClick={onNumber} onErase={onClear} selectedNumber={selectedValue} disabled={locked} />
      </div>
    </div>
  );
}
