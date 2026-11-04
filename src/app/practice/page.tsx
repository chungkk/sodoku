"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CandyLoader, WrapperRain } from "@/components/candy";
import { toolButtonClass } from "@/components/GameToolbar";
import { RefreshIcon } from "@/components/icons";
import { Mascot } from "@/components/Mascot";
import { SudokuStage } from "@/components/SudokuStage";
import { formatTime } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

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

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDifficulty = (searchParams.get("difficulty") as Difficulty) || "easy";

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [score, setScore] = useState(0);

  const game = useGame();
  const timer = useTimer();

  useEffect(() => {
    if (!game.isStarted) {
      game.startGame(initialDifficulty);
      timer.start();
    }
  }, []);

  useEffect(() => {
    if (game.isComplete && !showVictoryModal) {
      timer.pause();
      setShowVictoryModal(true);
    }
  }, [game.isComplete, showVictoryModal]);

  const handlePauseToggle = () => {
    timer.toggle();
  };

  const handleNumberClick = (num: number) => {
    if (timer.isPaused) return;
    if (game.mode === "note") {
      game.toggleNote(num);
    } else {
      game.inputNumber(num);
    }
  };

  const handleClear = () => {
    if (timer.isPaused) return;
    game.clearCell();
  };

  const handleUndo = () => {
    if (timer.isPaused) return;
    game.undo();
  };

  const handleHint = () => {
    if (timer.isPaused || hintsRemaining === 0) return;
    const used = game.useHint();
    if (used) {
      setHintsRemaining((prev) => prev - 1);
    }
  };

  const handleNewGame = () => {
    game.startGame(selectedDifficulty);
    timer.reset(0);
    timer.start();
    setHintsRemaining(3);
    setScore(0);
    setShowNewGameModal(false);
    setShowVictoryModal(false);
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    game.startGame(diff);
    timer.reset(0);
    timer.start();
    setHintsRemaining(3);
    setScore(0);
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
      if (timer.isPaused && e.key !== " " && e.key !== "Escape") return;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleClear();
      } else if (e.key === " ") {
        e.preventDefault();
        handlePauseToggle();
      } else if (e.key === "n" || e.key === "N") {
        game.toggleMode();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "ArrowUp" && game.selectedCell) {
        const [row, col] = game.selectedCell;
        if (row > 0) game.selectCell(row - 1, col);
      } else if (e.key === "ArrowDown" && game.selectedCell) {
        const [row, col] = game.selectedCell;
        if (row < 8) game.selectCell(row + 1, col);
      } else if (e.key === "ArrowLeft" && game.selectedCell) {
        const [row, col] = game.selectedCell;
        if (col > 0) game.selectCell(row, col - 1);
      } else if (e.key === "ArrowRight" && game.selectedCell) {
        const [row, col] = game.selectedCell;
        if (col < 8) game.selectCell(row, col + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.selectedCell, timer.isPaused, game.mode]);

  return (
    <>
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
        progress={
          <div className="hidden flex-wrap gap-1.5 lg:flex" role="group" aria-label="Độ khó">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
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
          <button onClick={() => setShowNewGameModal(true)} className={toolButtonClass}>
            <RefreshIcon /> Ván mới
          </button>
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
