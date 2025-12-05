"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SudokuBoard } from "@/components/SudokuBoard";
import { GameToolbar } from "@/components/GameToolbar";
import { NumberPad } from "@/components/NumberPad";
import { formatTime } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
  { value: "master", label: "Master" },
  { value: "extreme", label: "Extreme" },
];

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
  master: "Master",
  extreme: "Extreme",
};

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

  const selectedValue = game.selectedCell
    ? (game.puzzle[game.selectedCell[0]][game.selectedCell[1]] !== 0
        ? game.puzzle[game.selectedCell[0]][game.selectedCell[1]]
        : game.userInput[game.selectedCell[0]][game.selectedCell[1]])
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout (1024px+) */}
      <div className="hidden lg:block">
        {/* Top Bar - Difficulty tabs and Score */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 mr-2">Difficulty:</span>
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDifficultyChange(opt.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  game.difficulty === opt.value
                    ? "text-[#4a90d9]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="text-[#4a90d9] text-3xl font-bold">{score}</div>
        </div>

        {/* Main Content - Grid + Controls */}
        <div className="flex justify-center items-start gap-12 px-8 py-8">
          {/* Sudoku Board */}
          <div className="flex-shrink-0">
            <div className="w-[450px]">
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

          {/* Right Panel */}
          <div className="w-[280px] flex flex-col gap-6">
            {/* Mistakes & Time */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Mistakes</p>
                <p className="text-[#1e3a5f] text-xl font-medium">{game.errors}/3</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Time</p>
                  <p className="text-[#1e3a5f] text-xl font-medium">{formatTime(timer.seconds)}</p>
                </div>
                <button
                  onClick={handlePauseToggle}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-2">
              {/* Undo */}
              <button
                onClick={handleUndo}
                disabled={timer.isPaused || !game.canUndo}
                className={`flex flex-col items-center gap-1 w-14 h-14 rounded-full bg-[#f0f4f8] flex items-center justify-center ${
                  timer.isPaused || !game.canUndo ? "opacity-40" : "hover:bg-[#e0e8f0]"
                }`}
              >
                <svg className="w-6 h-6 text-[#5a7a9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4m-4 4l4 4" />
                </svg>
              </button>

              {/* Erase */}
              <button
                onClick={handleClear}
                disabled={timer.isPaused}
                className={`flex flex-col items-center gap-1 w-14 h-14 rounded-full bg-[#f0f4f8] flex items-center justify-center ${
                  timer.isPaused ? "opacity-40" : "hover:bg-[#e0e8f0]"
                }`}
              >
                <svg className="w-6 h-6 text-[#5a7a9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              {/* Notes */}
              <button
                onClick={game.toggleMode}
                disabled={timer.isPaused}
                className={`relative flex flex-col items-center gap-1 w-14 h-14 rounded-full bg-[#f0f4f8] flex items-center justify-center ${
                  timer.isPaused ? "opacity-40" : "hover:bg-[#e0e8f0]"
                } ${game.mode === "note" ? "ring-2 ring-[#4a90d9]" : ""}`}
              >
                <svg className={`w-6 h-6 ${game.mode === "note" ? "text-[#4a90d9]" : "text-[#5a7a9a]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {game.mode !== "note" && (
                  <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                    OFF
                  </span>
                )}
              </button>

            </div>

            {/* Number Pad - 3x3 Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  disabled={timer.isPaused}
                  className={`w-full aspect-square rounded-xl text-3xl font-medium transition-all ${
                    timer.isPaused
                      ? "bg-[#f0f4f8] text-gray-300 cursor-not-allowed"
                      : selectedValue === num
                      ? "bg-[#4a90d9] text-white"
                      : "bg-[#f0f4f8] text-[#1e3a5f] hover:bg-[#e0e8f0]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* New Game Button */}
            <button
              onClick={() => setShowNewGameModal(true)}
              className="w-full py-4 bg-[#5a7a9a] text-white text-lg font-medium rounded-xl hover:bg-[#4a6a8a] transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </div>

      {/* iPad/Tablet Layout (768px-1023px) */}
      <div className="hidden md:block lg:hidden">
        <div className="flex flex-col items-center min-h-screen py-4 px-6">
          {/* Top Bar - Info */}
          <div className="w-full max-w-[600px] flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Difficulty</span>
              <span className="text-[#1e3a5f] text-lg font-medium">{difficultyLabels[game.difficulty]}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm">Mistakes</span>
              <span className="text-[#1e3a5f] text-lg font-medium">{game.errors}/3</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-gray-400 text-sm">Time</span>
                <span className="text-[#1e3a5f] text-lg font-medium">{formatTime(timer.seconds)}</span>
              </div>
              <button
                onClick={handlePauseToggle}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                {timer.isPaused ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sudoku Board - Larger for iPad */}
          <div className="w-full max-w-[600px] mb-6">
            <SudokuBoard
              puzzle={game.puzzle}
              userInput={game.userInput}
              notes={game.notes}
              selectedCell={game.selectedCell}
              onCellClick={game.selectCell}
              isPaused={timer.isPaused}
            />
          </div>

          {/* Controls Section */}
          <div className="w-full max-w-[600px]">
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <button
                onClick={handleUndo}
                disabled={timer.isPaused || !game.canUndo}
                className={`flex flex-col items-center gap-2 ${
                  timer.isPaused || !game.canUndo ? "opacity-40" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#f0f4f8] flex items-center justify-center hover:bg-[#e0e8f0]">
                  <svg className="w-7 h-7 text-[#5a7a9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4m-4 4l4 4" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Undo</span>
              </button>

              <button
                onClick={handleClear}
                disabled={timer.isPaused}
                className={`flex flex-col items-center gap-2 ${
                  timer.isPaused ? "opacity-40" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#f0f4f8] flex items-center justify-center hover:bg-[#e0e8f0]">
                  <svg className="w-7 h-7 text-[#5a7a9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Erase</span>
              </button>

              <button
                onClick={game.toggleMode}
                disabled={timer.isPaused}
                className={`flex flex-col items-center gap-2 ${
                  timer.isPaused ? "opacity-40" : ""
                }`}
              >
                <div className={`relative w-16 h-16 rounded-full bg-[#f0f4f8] flex items-center justify-center hover:bg-[#e0e8f0] ${
                  game.mode === "note" ? "ring-2 ring-[#4a90d9]" : ""
                }`}>
                  <svg className={`w-7 h-7 ${game.mode === "note" ? "text-[#4a90d9]" : "text-[#5a7a9a]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {game.mode !== "note" && (
                    <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      OFF
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">Notes</span>
              </button>

            </div>

            {/* Number Pad - 3x3 Grid for iPad */}
            <div className="grid grid-cols-9 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  disabled={timer.isPaused}
                  className={`w-full aspect-square rounded-xl text-2xl font-medium transition-all ${
                    timer.isPaused
                      ? "bg-[#f0f4f8] text-gray-300 cursor-not-allowed"
                      : selectedValue === num
                      ? "bg-[#4a90d9] text-white"
                      : "bg-[#f0f4f8] text-[#1e3a5f] hover:bg-[#e0e8f0]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Bottom Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowNewGameModal(true)}
                className="flex-1 py-4 bg-[#5a7a9a] text-white text-lg font-medium rounded-xl hover:bg-[#4a6a8a] transition-colors"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Fixed Full Layout */}
      <div className="md:hidden fixed inset-0 flex flex-col bg-white z-40">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100">
          <div className="h-14 px-4 flex items-center justify-between">
            <span className="text-2xl">🧩</span>
            <span className="text-lg font-bold text-gray-900">Sudoku</span>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Top Section: Info */}
        <div className="flex-shrink-0 bg-gradient-to-b from-slate-50 to-white">
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                <span className="text-xs text-slate-400">Level</span>
                <span className="text-sm font-semibold text-[#1e3a5f]">{difficultyLabels[game.difficulty]}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                <span className="text-xs text-slate-400">Lỗi</span>
                <span className="text-sm font-semibold text-[#1e3a5f]">{game.errors}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Time</span>
                  <span className="text-sm font-semibold text-[#1e3a5f] tabular-nums">{formatTime(timer.seconds)}</span>
                </div>
                <button
                  onClick={handlePauseToggle}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  {timer.isPaused ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Sudoku Board */}
        <div className="flex-1 flex items-center justify-center px-3 py-2 min-h-0">
          <div className="w-full max-w-[min(100%,calc(100vh-320px))] aspect-square">
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

        {/* Bottom Section: Toolbar + NumberPad + New Game + Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 pb-safe">
          <GameToolbar
            onUndo={handleUndo}
            onErase={handleClear}
            onToggleNotes={game.toggleMode}
            isNotesMode={game.mode === "note"}
            canUndo={game.canUndo}
            disabled={timer.isPaused}
          />
          <NumberPad
            onNumberClick={handleNumberClick}
            selectedNumber={selectedValue}
            disabled={timer.isPaused}
          />
          <div className="px-4 py-1">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowNewGameModal(true)}
              className="text-[#4a90d9] text-sm"
            >
              New Game
            </Button>
          </div>
          <div className="text-center pb-2 text-xs text-gray-400">
            🧩 Sudoku Game
          </div>
        </div>
      </div>

      {/* Victory Modal */}
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

      {/* New Game Modal */}
      <Dialog open={showNewGameModal} onClose={() => setShowNewGameModal(false)}>
        <DialogHeader>
          <DialogTitle>New Game</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600 mb-4">
            Chọn độ khó cho ván mới:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDifficulty === opt.value
                    ? "bg-[#4a90d9] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
