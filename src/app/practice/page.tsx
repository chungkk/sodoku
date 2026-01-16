"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SudokuBoard } from "@/components/SudokuBoard";
import { GameToolbar } from "@/components/GameToolbar";
import { NumberPad } from "@/components/NumberPad";
import { formatTime } from "@/components/Timer";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "EASY", color: "text-green-400" },
  { value: "medium", label: "MEDIUM", color: "text-yellow-400" },
  { value: "hard", label: "HARD", color: "text-red-400" },
  { value: "expert", label: "EXPERT", color: "text-purple-400" },
  { value: "master", label: "MASTER", color: "text-pink-400" },
  { value: "extreme", label: "EXTREME", color: "text-red-500" },
];

const difficultyLabels: Record<Difficulty, string> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
  expert: "EXPERT",
  master: "MASTER",
  extreme: "EXTREME",
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
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Retro Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Desktop Layout (1024px+) */}
      <div className="hidden lg:block relative">
        {/* Top Bar */}
        <div className="flex items-center justify-center gap-4 px-8 py-5 border-b-2 border-cyan-400/30 bg-[#0d1117]/80 backdrop-blur-sm">
          <div className="flex items-center gap-1 p-1 border-2 border-cyan-400/50">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDifficultyChange(opt.value)}
                className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-200 ${game.difficulty === opt.value
                    ? "bg-cyan-500 text-black"
                    : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewGameModal(true)}
            className="px-5 py-2.5 text-sm font-mono uppercase tracking-wider transition-all duration-200 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
          >
            NEW GAME
          </button>
        </div>

        {/* Main Content */}
        <div className="flex justify-center items-start gap-12 px-8 py-8">
          {/* Sudoku Board */}
          <div className="flex-shrink-0">
            <div className="w-[450px] border-2 border-cyan-400/50 p-1 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
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
            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-cyan-400/30 bg-cyan-400/5">
                <span className="text-xs text-gray-500 font-mono uppercase">LỖI</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">{game.errors}</span>
              </div>
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-cyan-400/30 bg-cyan-400/5">
                <span className="text-xs text-gray-500 font-mono uppercase">TIME</span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums font-mono">{formatTime(timer.seconds)}</span>
                <button
                  onClick={handlePauseToggle}
                  className="ml-auto w-9 h-9 border border-cyan-400/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/20 transition-colors"
                >
                  {timer.isPaused ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={handleUndo}
                disabled={timer.isPaused || !game.canUndo}
                className={`flex flex-col items-center gap-1 w-14 h-14 border border-cyan-400/30 flex items-center justify-center ${timer.isPaused || !game.canUndo ? "opacity-40" : "hover:bg-cyan-400/20 hover:border-cyan-400"
                  }`}
              >
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4m-4 4l4 4" />
                </svg>
              </button>

              <button
                onClick={handleClear}
                disabled={timer.isPaused}
                className={`flex flex-col items-center gap-1 w-14 h-14 border border-cyan-400/30 flex items-center justify-center ${timer.isPaused ? "opacity-40" : "hover:bg-cyan-400/20 hover:border-cyan-400"
                  }`}
              >
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <button
                onClick={game.toggleMode}
                disabled={timer.isPaused}
                className={`relative flex flex-col items-center gap-1 w-14 h-14 border flex items-center justify-center transition-all ${timer.isPaused ? "opacity-40 border-cyan-400/30" : "hover:bg-cyan-400/20"
                  } ${game.mode === "note" ? "border-pink-500 bg-pink-500/20" : "border-cyan-400/30 hover:border-cyan-400"}`}
              >
                <svg className={`w-6 h-6 ${game.mode === "note" ? "text-pink-400" : "text-cyan-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {game.mode !== "note" && (
                  <span className="absolute -top-1 -right-1 bg-gray-600 text-gray-300 text-[9px] px-1.5 py-0.5 font-mono">
                    OFF
                  </span>
                )}
              </button>
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  disabled={timer.isPaused}
                  className={`w-full aspect-square text-3xl font-mono font-bold transition-all border-2 ${timer.isPaused
                      ? "border-gray-700 text-gray-600 cursor-not-allowed"
                      : selectedValue === num
                        ? "border-cyan-400 bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                        : "border-cyan-400/30 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/10"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden fixed inset-0 flex flex-col bg-[#0a0a1a] z-40">
        {/* Header */}
        <div className="flex-shrink-0 bg-[#0d1117] border-b-2 border-cyan-400/30">
          <div className="h-14 px-4 flex items-center justify-between">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">🧩</span>
            <span
              className="text-lg font-black uppercase tracking-wider text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(180deg, #fff 0%, #00ffff 100%)' }}
            >
              SUDOKU
            </span>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 bg-[#0d1117]/50">
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-cyan-400/30 bg-cyan-400/5">
                <span className="text-xs text-gray-500 font-mono">LVL</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{difficultyLabels[game.difficulty]}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-cyan-400/30 bg-cyan-400/5">
                <span className="text-xs text-gray-500 font-mono">ERR</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{game.errors}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 border border-cyan-400/30 bg-cyan-400/5">
                <span className="text-sm font-bold text-cyan-400 tabular-nums font-mono">{formatTime(timer.seconds)}</span>
                <button
                  onClick={handlePauseToggle}
                  className="w-7 h-7 border border-cyan-400/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/20 transition-colors"
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

        {/* Board */}
        <div className="flex-1 flex items-center justify-center px-3 py-2 min-h-0">
          <div className="w-full max-w-[min(100%,calc(100vh-320px))] aspect-square border border-cyan-400/30">
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

        {/* Controls */}
        <div className="flex-shrink-0 border-t border-cyan-400/30 pb-safe bg-[#0d1117]">
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
            <button
              onClick={() => setShowNewGameModal(true)}
              className="w-full py-2 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:text-cyan-300"
            >
              [ NEW GAME ]
            </button>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      <Dialog open={showVictoryModal} onClose={() => { }}>
        <DialogHeader>
          <DialogTitle className="text-center">🎉 VICTORY!</DialogTitle>
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
          <p className="text-gray-400 font-mono mb-4">
            PUZZLE COMPLETED!
          </p>
          <div className="grid grid-cols-3 gap-4 border border-cyan-400/30 bg-cyan-400/5 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400 font-mono">{formatTime(timer.seconds)}</p>
              <p className="text-xs text-gray-500 font-mono">TIME</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400 font-mono">{game.errors}</p>
              <p className="text-xs text-gray-500 font-mono">ERRORS</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-cyan-400 font-mono">
                {difficultyLabels[game.difficulty]}
              </p>
              <p className="text-xs text-gray-500 font-mono">LEVEL</p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button
            onClick={handleGoHome}
            className="w-full py-3 border-2 border-cyan-400 text-cyan-400 font-mono uppercase tracking-wider hover:bg-cyan-400/10"
          >
            ▸ HOME
          </button>
          <button
            onClick={handlePlayAgain}
            className="w-full py-3 bg-cyan-500 text-black font-mono uppercase tracking-wider hover:bg-cyan-400"
          >
            ▸ PLAY AGAIN
          </button>
        </DialogFooter>
      </Dialog>

      {/* New Game Modal */}
      <Dialog open={showNewGameModal} onClose={() => setShowNewGameModal(false)}>
        <DialogHeader>
          <DialogTitle>NEW GAME</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-400 font-mono mb-4 text-sm">
            ► SELECT DIFFICULTY:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`px-4 py-3 text-sm font-mono uppercase tracking-wider transition-all border-2 ${selectedDifficulty === opt.value
                    ? "border-cyan-400 bg-cyan-500 text-black"
                    : "border-cyan-400/30 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </DialogContent>
        <DialogFooter>
          <button
            onClick={() => setShowNewGameModal(false)}
            className="px-4 py-2 text-gray-500 font-mono text-sm uppercase tracking-wider hover:text-cyan-400"
          >
            [ CANCEL ]
          </button>
          <button
            onClick={handleNewGame}
            className="px-6 py-2 bg-cyan-500 text-black font-mono uppercase tracking-wider hover:bg-cyan-400"
          >
            ▸ START
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a1a]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🧩</div>
          <p className="text-cyan-400 font-mono uppercase tracking-wider">LOADING...</p>
        </div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
