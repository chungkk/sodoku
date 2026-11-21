"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CandyLoader, WrapperRain } from "@/components/candy";
import { toolButtonClass } from "@/components/GameToolbar";
import { RedoIcon, RefreshIcon } from "@/components/icons";
import { Mascot } from "@/components/Mascot";
import { SudokuStage } from "@/components/SudokuStage";
import { formatTime } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

const PRACTICE_STORAGE_KEY = "sudoku_practice_state_v1";

interface StoredPracticeState {
  puzzle: number[][];
  solution: number[][];
  userInput: (number | null)[][];
  notes: number[][][];
  difficulty: Difficulty;
  errors: number;
  seconds: number;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
  expert: "Chuyên gia",
  master: "Bậc thầy",
  extreme: "Cực khó",
};

const difficultyOptions = (Object.keys(difficultyLabels) as Difficulty[]).map((value) => ({
  value,
  label: difficultyLabels[value],
}));

const VALID_DIFFICULTIES = new Set<string>(Object.keys(difficultyLabels));

function parseDifficulty(value: string | null): Difficulty {
  return value && VALID_DIFFICULTIES.has(value) ? (value as Difficulty) : "easy";
}

function loadSavedPractice(requestedDiff: string | null): StoredPracticeState | null {
  try {
    const raw = localStorage.getItem(PRACTICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPracticeState;
    if (
      !parsed ||
      !VALID_DIFFICULTIES.has(parsed.difficulty) ||
      !Array.isArray(parsed.puzzle) ||
      parsed.puzzle.length !== 9 ||
      !Array.isArray(parsed.solution) ||
      parsed.solution.length !== 9 ||
      !Array.isArray(parsed.userInput) ||
      parsed.userInput.length !== 9
    ) {
      return null;
    }
    if (requestedDiff && VALID_DIFFICULTIES.has(requestedDiff) && parsed.difficulty !== requestedDiff) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearSavedPractice() {
  try {
    localStorage.removeItem(PRACTICE_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedDifficulty = searchParams.get("difficulty");
  const initialDifficulty = parseDifficulty(requestedDifficulty);

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);

  const game = useGame();
  const timer = useTimer();

  useEffect(() => {
    if (!game.isStarted) {
      const saved = loadSavedPractice(requestedDifficulty);
      if (saved) {
        const notes: Set<number>[][] = Array.isArray(saved.notes) && saved.notes.length === 9
          ? saved.notes.map((row) => row.map((cell) => new Set(Array.isArray(cell) ? cell : [])))
          : Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
        setSelectedDifficulty(saved.difficulty);
        game.loadPuzzleWithState(saved.puzzle, saved.solution, saved.difficulty, saved.userInput, notes, {
          errors: typeof saved.errors === "number" ? saved.errors : 0,
        });
        timer.reset(typeof saved.seconds === "number" ? saved.seconds : 0);
        timer.start();
      } else {
        game.startGame(initialDifficulty);
        timer.start();
      }
    }
  }, []);

  useEffect(() => {
    if (game.isComplete && !showVictoryModal) {
      timer.pause();
      clearSavedPractice();
      setShowVictoryModal(true);
    }
  }, [game.isComplete, showVictoryModal]);

  useEffect(() => {
    if (!game.isStarted || game.isComplete || !game.solution) return;
    try {
      const payload: StoredPracticeState = {
        puzzle: game.puzzle,
        solution: game.solution,
        userInput: game.userInput,
        notes: game.notes.map((row) => row.map((cell) => Array.from(cell))),
        difficulty: game.difficulty,
        errors: game.errors,
        seconds: timer.seconds,
      };
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota/private-mode errors
    }
  }, [game.isStarted, game.isComplete, game.puzzle, game.solution, game.userInput, game.notes, game.difficulty, game.errors, timer.seconds]);

  const handlePauseToggle = () => {
    timer.toggle();
  };

  const handleNumberClick = (num: number) => {
    if (timer.isPaused) return;
    game.inputNumber(num);
  };

  const handleClear = () => {
    if (timer.isPaused) return;
    game.clearCell();
  };

  const handleUndo = () => {
    if (timer.isPaused) return;
    game.undo();
  };

  const handleRedo = () => {
    if (timer.isPaused) return;
    game.redo();
  };

  const handleNewGame = () => {
    clearSavedPractice();
    game.startGame(selectedDifficulty);
    timer.reset(0);
    timer.start();
    setShowNewGameModal(false);
    setShowVictoryModal(false);
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    clearSavedPractice();
    setSelectedDifficulty(diff);
    game.startGame(diff);
    timer.reset(0);
    timer.start();
  };

  const handlePlayAgain = () => {
    setShowVictoryModal(false);
    setShowNewGameModal(true);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showNewGameModal || showVictoryModal) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }
      if (timer.isPaused && e.key !== " " && e.key !== "Escape") return;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberClick(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleClear();
      } else if (e.key === " ") {
        e.preventDefault();
        handlePauseToggle();
      } else if (e.key === "n" || e.key === "N") {
        game.toggleMode();
      } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (e.key.toLowerCase() === "y" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        if (!game.selectedCell) {
          game.selectCell(0, 0);
          return;
        }
        const [row, col] = game.selectedCell;
        if (e.key === "ArrowUp" && row > 0) game.selectCell(row - 1, col);
        else if (e.key === "ArrowDown" && row < 8) game.selectCell(row + 1, col);
        else if (e.key === "ArrowLeft" && col > 0) game.selectCell(row, col - 1);
        else if (e.key === "ArrowRight" && col < 8) game.selectCell(row, col + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.selectedCell, timer.isPaused, game.mode, showNewGameModal, showVictoryModal]);

  return (
    <>
      <h1 className="sr-only">Luyện tập Sudoku</h1>
      <SudokuStage
        game={game}
        seconds={timer.seconds}
        locked={timer.isPaused}
        paused={timer.isPaused}
        onPauseToggle={handlePauseToggle}
        onNumber={handleNumberClick}
        onClear={handleClear}
        onUndo={handleUndo}
        say={
          timer.isPaused
            ? "Bấm nút chạy tiếp khi sẵn sàng nhé."
            : game.mode === "note"
              ? "Chạm số để ghi chú vào ô nhé."
              : game.selectedCell
                ? "Chọn số để thả vào ô nào!"
                : "Chạm một ô trống đi nào!"
        }
        mood={timer.isPaused ? "sleep" : game.selectedCell ? "think" : "happy"}
        badge={difficultyLabels[game.difficulty]}
        badgeMobileOnly
        backHref="/"
        toolbarColumns={4}
        progress={
          <div className="hidden flex-wrap gap-1.5 lg:flex" role="group" aria-label="Độ khó">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={game.difficulty === opt.value}
                onClick={() => handleDifficultyChange(opt.value)}
                className={`min-h-10 rounded-full border-[3px] border-ink px-3 font-bold transition-colors ${
                  game.difficulty === opt.value ? "bg-lemon" : "bg-milk hover:bg-lemon-pale"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
        action={
          <>
            <button
              type="button"
              onClick={handleRedo}
              disabled={timer.isPaused || !game.canRedo}
              className={toolButtonClass}
            >
              <RedoIcon /> Làm lại
            </button>
            <button type="button" onClick={() => setShowNewGameModal(true)} className={toolButtonClass}>
              <RefreshIcon /> Ván mới
            </button>
          </>
        }
      />

      {showVictoryModal && <WrapperRain />}

      <Dialog open={showVictoryModal} onClose={() => { }}>
        <DialogHeader className="flex flex-col items-center text-center">
          <Mascot mood="cheer" className="w-32" />
          <DialogTitle>Giải xong rồi!</DialogTitle>
          <p className="mt-1 text-lg font-semibold">Giỏi quá, thử thêm ván nữa nhé!</p>
        </DialogHeader>
        <DialogContent>
          <dl className="grid grid-cols-3 gap-1.5 text-center">
            {[
              ["Thời gian", formatTime(timer.seconds)],
              ["Số lỗi", String(game.errors)],
              ["Độ khó", difficultyLabels[game.difficulty]],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border-[3px] border-ink bg-white p-2">
                <dd className="font-display text-xl leading-tight tabular-nums">{value}</dd>
                <dt className="font-semibold leading-tight text-ink-soft">{label}</dt>
              </div>
            ))}
          </dl>
        </DialogContent>
        <DialogFooter className="flex-col items-center gap-2">
          <Button wrapped fullWidth size="lg" onClick={handlePlayAgain}>
            Chơi ván nữa
          </Button>
          <Button variant="outline" onClick={handleGoHome} fullWidth>
            Về trang chủ
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showNewGameModal} onClose={() => setShowNewGameModal(false)}>
        <DialogHeader>
          <DialogTitle>Ván mới độ khó nào?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Độ khó">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                aria-pressed={selectedDifficulty === opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`min-h-12 rounded-full border-4 border-ink font-bold transition-colors ${
                  selectedDifficulty === opt.value ? "bg-lemon" : "bg-white hover:bg-lemon-pale"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewGameModal(false)}>
            Để sau
          </Button>
          <Button onClick={handleNewGame}>
            Bắt đầu
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<CandyLoader label="Đang mở khay kẹo…" />}>
      <PracticeContent />
    </Suspense>
  );
}
