"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SudokuBoard } from "@/components/SudokuBoard";
import { NumberPad } from "@/components/NumberPad";
import { GameToolbar } from "@/components/GameToolbar";
import { formatTime } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDifficulty = (searchParams.get("difficulty") as Difficulty) || "medium";

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);

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

      fetch("/api/player/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "practice",
          difficulty: game.difficulty,
          time: timer.seconds,
          errors: game.errors,
          result: "completed",
        }),
      }).catch(console.error);
    }
  }, [game.isComplete, showVictoryModal, game.difficulty, timer.seconds, game.errors]);

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
    setShowNewGameModal(false);
    setShowVictoryModal(false);
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

  const selectedValue = game.selectedCell
    ? (game.puzzle[game.selectedCell[0]][game.selectedCell[1]] !== 0
        ? game.puzzle[game.selectedCell[0]][game.selectedCell[1]]
        : game.userInput[game.selectedCell[0]][game.selectedCell[1]])
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        {/* Info Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Difficulty</span>
            <span className="text-[#1e3a5f] font-medium">{difficultyLabels[game.difficulty]}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs">Mistakes</span>
            <span className="text-[#1e3a5f] font-medium">{game.errors}/3</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-xs">Time</span>
              <span className="text-[#1e3a5f] font-medium">{formatTime(timer.seconds)}</span>
            </div>
            <button
              onClick={handlePauseToggle}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
            >
              {timer.isPaused ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sudoku Board */}
      <div className="flex justify-center px-3">
        <div className="w-full max-w-[400px]">
          <SudokuBoard
            puzzle={game.puzzle}
            userInput={game.userInput}
            notes={game.notes}
            selectedCell={game.selectedCell}
            onCellClick={game.selectCell}
            isPaused={timer.isPaused}
          />
        </div>
      </div>

      {/* Toolbar + Number Pad */}
      <div className="pb-4">
        <GameToolbar
          onUndo={handleUndo}
          onErase={handleClear}
          onToggleNotes={game.toggleMode}
          onHint={handleHint}
          isNotesMode={game.mode === "note"}
          hintsRemaining={hintsRemaining}
          canUndo={game.canUndo}
          disabled={timer.isPaused}
        />
        <NumberPad
          onNumberClick={handleNumberClick}
          selectedNumber={selectedValue}
          disabled={timer.isPaused}
        />
      </div>

      <Dialog open={showVictoryModal} onClose={() => {}}>
        <DialogHeader>
          <DialogTitle className="text-center">🎉 Chúc mừng!</DialogTitle>
        </DialogHeader>
        <DialogContent className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <p className="text-gray-600 mb-4">
            Bạn đã hoàn thành bài Sudoku!
          </p>
          <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatTime(timer.seconds)}</p>
              <p className="text-sm text-gray-500">Thời gian</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{game.errors}</p>
              <p className="text-sm text-gray-500">Lỗi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {difficultyLabels[game.difficulty]}
              </p>
              <p className="text-sm text-gray-500">Độ khó</p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleGoHome} fullWidth>
            🏠 Về trang chủ
          </Button>
          <Button onClick={handlePlayAgain} fullWidth>
            🎮 Chơi lại
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showNewGameModal} onClose={() => setShowNewGameModal(false)}>
        <DialogHeader>
          <DialogTitle>Ván mới</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600 mb-4">
            Chọn độ khó cho ván mới:
          </p>
          <Select
            options={difficultyOptions}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowNewGameModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleNewGame}>
            Bắt đầu
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🧩</div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
