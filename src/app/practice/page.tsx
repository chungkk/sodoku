"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SudokuBoard } from "@/components/SudokuBoard";
import { NumberPad } from "@/components/NumberPad";
import { Timer, formatTime } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions = [
  { value: "easy", label: "🟢 Dễ" },
  { value: "medium", label: "🟡 Trung bình" },
  { value: "hard", label: "🔴 Khó" },
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

  const handleNewGame = () => {
    game.startGame(selectedDifficulty);
    timer.reset(0);
    timer.start();
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
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-6">
      {/* Header - compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-2 mb-3 sm:mb-6"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Sudoku</h1>
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium">
            {difficultyLabels[game.difficulty]}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Lỗi: <span className="font-bold text-error-600">{game.errors}</span></span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewGameModal(true)}
            className="hidden sm:flex"
          >
            🔄
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 items-start justify-center">
        {/* Sudoku Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[360px] sm:max-w-[400px] mx-auto lg:mx-0"
        >
          <SudokuBoard
            puzzle={game.puzzle}
            userInput={game.userInput}
            notes={game.notes}
            selectedCell={game.selectedCell}
            onCellClick={game.selectCell}
            isPaused={timer.isPaused}
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full max-w-[360px] sm:max-w-[400px] mx-auto lg:w-auto"
        >
          {/* Timer & Progress - compact bar on mobile */}
          <div className="flex items-center justify-between mb-3 px-1">
            <Timer
              seconds={timer.seconds}
              isPaused={timer.isPaused}
              onPauseToggle={handlePauseToggle}
            />
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${game.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-gray-500">{game.progress}%</span>
            </div>
          </div>

          {/* Number Pad */}
          <NumberPad
            onNumberClick={handleNumberClick}
            onClear={handleClear}
            onToggleNoteMode={game.toggleMode}
            isNoteMode={game.mode === "note"}
            selectedNumber={null}
            disabled={timer.isPaused}
          />

          {/* Keyboard shortcuts - hidden on mobile */}
          <div className="hidden sm:block text-xs text-gray-500 text-center pt-3 mt-3 border-t border-gray-100">
            <p>⌨️ Phím tắt: 1-9 nhập số, Space tạm dừng, N chế độ nháp</p>
          </div>
        </motion.div>
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
