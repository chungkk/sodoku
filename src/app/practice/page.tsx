"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { ChevronDown, RotateCcw, PenLine, Delete, Lightbulb, Pause, Play, MoreHorizontal } from "lucide-react";
import { generatePuzzle, boardToGrid, gridToBoard, validateCell, getConflicts } from "@/lib/sudoku";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";
type InputMode = "fill" | "notes";

interface PuzzleData {
  initialBoard: string;
  solution: string;
  difficulty: Difficulty;
  givens: number;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình", 
  hard: "Khó",
};

export default function PracticePage() {
  const router = useRouter();
  const { player } = usePlayer();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [conflicts, setConflicts] = useState<{ row: number; col: number }[]>([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("fill");
  const [notes, setNotes] = useState<number[][][]>([]);
  const [helpEnabled, setHelpEnabled] = useState(true);

  const createEmptyNotes = () => 
    Array(9).fill(null).map(() => Array(9).fill(null).map(() => [] as number[]));

  const startNewGame = useCallback((diff: Difficulty) => {
    const puzzle = generatePuzzle(diff);
    setPuzzleData(puzzle);
    setBoard(boardToGrid(puzzle.initialBoard));
    setSelectedCell(null);
    setConflicts([]);
    setMistakesCount(0);
    setStartTime(Date.now());
    setElapsedMs(0);
    setIsComplete(false);
    setIsPaused(false);
    setInputMode("fill");
    setNotes(createEmptyNotes());
  }, []);

  useEffect(() => {
    if (!player) {
      router.push("/");
      return;
    }
    startNewGame(difficulty);
  }, [player, router]);

  useEffect(() => {
    if (!startTime || isComplete || isPaused) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, isComplete, isPaused]);

  useEffect(() => {
    if (!puzzleData || isComplete) return;
    const currentBoard = board.map((row) => row.join("")).join("");
    if (currentBoard === puzzleData.solution) {
      setIsComplete(true);
      toast.success("Chúc mừng! Bạn đã hoàn thành!");
    }
  }, [board, puzzleData, isComplete]);

  const handleCellClick = (row: number, col: number) => {
    if (!puzzleData) return;
    const initialGrid = boardToGrid(puzzleData.initialBoard);
    if (initialGrid[row][col] !== 0) {
      setSelectedCell({ row, col });
      return;
    }
    setSelectedCell({ row, col });
    setConflicts([]);
  };

  const handleNumberInput = (value: number) => {
    if (!selectedCell || !puzzleData) return;
    const { row, col } = selectedCell;
    const initialGrid = boardToGrid(puzzleData.initialBoard);
    if (initialGrid[row][col] !== 0) return;

    if (inputMode === "notes") {
      if (board[row][col] !== 0) return;
      setNotes((prev) => {
        const newNotes = prev.map((r) => r.map((c) => [...c]));
        const cellNotes = newNotes[row][col];
        if (cellNotes.includes(value)) {
          newNotes[row][col] = cellNotes.filter(n => n !== value);
        } else {
          newNotes[row][col] = [...cellNotes, value].sort();
        }
        return newNotes;
      });
      return;
    }

    const isValid = validateCell(puzzleData.solution, row, col, value);
    if (isValid) {
      setBoard((prev) => {
        const newBoard = prev.map((r) => [...r]);
        newBoard[row][col] = value;
        return newBoard;
      });
      setNotes((prev) => {
        const newNotes = prev.map((r) => r.map((c) => [...c]));
        newNotes[row][col] = [];
        return newNotes;
      });
      setConflicts([]);
    } else {
      const boardStr = gridToBoard(board);
      const conflictCells = getConflicts(boardStr, row, col, value);
      setConflicts(conflictCells);
      setMistakesCount((prev) => prev + 1);
    }
  };

  const handleClear = () => {
    if (!selectedCell || !puzzleData) return;
    const { row, col } = selectedCell;
    const initialGrid = boardToGrid(puzzleData.initialBoard);
    if (initialGrid[row][col] !== 0) return;

    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = 0;
      return newBoard;
    });
    setNotes((prev) => {
      const newNotes = prev.map((r) => r.map((c) => [...c]));
      newNotes[row][col] = [];
      return newNotes;
    });
    setConflicts([]);
  };

  const formatTime = () => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const { row: selRow, col: selCol } = selectedCell;
    if (row === selRow || col === selCol) return true;
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selBoxRow = Math.floor(selRow / 3);
    const selBoxCol = Math.floor(selCol / 3);
    return boxRow === selBoxRow && boxCol === selBoxCol;
  };

  const isConflict = (row: number, col: number): boolean => {
    return conflicts.some((c) => c.row === row && c.col === col);
  };

  const isSameValue = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const selectedValue = board[selectedCell.row][selectedCell.col];
    if (selectedValue === 0) return false;
    return board[row][col] === selectedValue;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      switch (e.key) {
        case "ArrowUp": e.preventDefault(); if (row > 0) handleCellClick(row - 1, col); break;
        case "ArrowDown": e.preventDefault(); if (row < 8) handleCellClick(row + 1, col); break;
        case "ArrowLeft": e.preventDefault(); if (col > 0) handleCellClick(row, col - 1); break;
        case "ArrowRight": e.preventDefault(); if (col < 8) handleCellClick(row, col + 1); break;
        case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9":
          e.preventDefault(); handleNumberInput(parseInt(e.key, 10)); break;
        case "Backspace": case "Delete": case "0":
          e.preventDefault(); handleClear(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, puzzleData, board, inputMode]);

  if (!player || !puzzleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-gray-500">Đang tải...</div>
      </div>
    );
  }

  const initialGrid = boardToGrid(puzzleData.initialBoard);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/")} className="text-gray-900 font-semibold text-lg">
              Sudoku
            </button>
            <span className="text-gray-400">&gt;</span>
            <div className="relative">
              <button 
                onClick={() => setShowDifficultyMenu(!showDifficultyMenu)}
                className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
              >
                {difficultyLabels[difficulty]}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDifficultyMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(d); setShowDifficultyMenu(false); startNewGame(d); }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-gray-100",
                        d === difficulty && "bg-red-50 text-red-500"
                      )}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-700">Sai: <span className="font-semibold">{mistakesCount}</span></span>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  <button
                    onClick={() => { startNewGame(difficulty); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Chơi lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-6">
        {/* Sudoku Board */}
        <div className="border-2 border-gray-900">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div key={row} className="flex">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((col) => {
                const value = board[row][col];
                const isInitial = initialGrid[row][col] !== 0;
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                const cellNotes = notes[row]?.[col] || [];
                
                const rightBorder = col === 2 || col === 5;
                const bottomBorder = row === 2 || row === 5;
                
                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    className={cn(
                      "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl font-medium border-r border-b border-gray-300 transition-colors",
                      rightBorder && "border-r-2 border-r-gray-900",
                      bottomBorder && "border-b-2 border-b-gray-900",
                      col === 0 && "border-l border-l-gray-300",
                      row === 0 && "border-t border-t-gray-300",
                      isSelected && "bg-red-200",
                      !isSelected && isHighlighted(row, col) && "bg-gray-100",
                      !isSelected && !isHighlighted(row, col) && isSameValue(row, col) && "bg-red-50",
                      isConflict(row, col) && "bg-red-300 text-red-700",
                      isInitial ? "text-gray-900 font-bold" : "text-gray-600"
                    )}
                  >
                    {value !== 0 ? value : (
                      cellNotes.length > 0 && (
                        <span className="text-[8px] text-gray-400 leading-tight">
                          {cellNotes.slice(0, 4).join(" ")}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-center gap-4 w-full max-w-[360px]">
          {/* Notes Toggle */}
          <button 
            onClick={() => setInputMode(inputMode === "notes" ? "fill" : "notes")}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 min-w-[80px]",
              inputMode === "notes" 
                ? "border-red-500 bg-white" 
                : "border-gray-200 bg-white"
            )}
          >
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded",
              inputMode === "notes" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
            )}>
              {inputMode === "notes" ? "Bật" : "Tắt"}
            </span>
            <div className="flex items-center gap-1">
              <PenLine className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Ghi chú</span>
            </div>
          </button>

          {/* Timer */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-mono font-semibold text-gray-900">{formatTime()}</span>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>

          {/* Help Toggle */}
          <button 
            onClick={() => setHelpEnabled(!helpEnabled)}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 min-w-[80px]",
              helpEnabled 
                ? "border-red-500 bg-white" 
                : "border-gray-200 bg-white"
            )}
          >
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded",
              helpEnabled ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
            )}>
              {helpEnabled ? "Bật" : "Tắt"}
            </span>
            <div className="flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Gợi ý</span>
            </div>
          </button>
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-[360px]">
          <div className="grid grid-cols-5 gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell || isComplete}
                className="h-14 bg-red-50 hover:bg-red-100 text-red-600 text-2xl font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {num}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell || isComplete}
                className="h-14 bg-red-50 hover:bg-red-100 text-red-600 text-2xl font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={!selectedCell || isComplete}
              className="h-14 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Hoàn thành!</h2>
            <p className="text-gray-600 mb-2">Thời gian: <span className="font-semibold">{formatTime()}</span></p>
            <p className="text-gray-600 mb-6">Số lần sai: <span className="font-semibold">{mistakesCount}</span></p>
            <button 
              onClick={() => startNewGame(difficulty)}
              className="bg-red-500 text-white px-8 py-3 rounded-full font-medium hover:bg-red-600 transition-colors"
            >
              Chơi tiếp
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
