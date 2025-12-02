"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { ChevronDown, RotateCcw, PenLine, Delete, Lightbulb, Pause, Play, MoreHorizontal, Home, Trophy } from "lucide-react";
import { generatePuzzle, boardToGrid, gridToBoard, validateCell, getConflicts } from "@/lib/sudoku";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-accent/10 text-accent border-accent/30",
  medium: "bg-primary/10 text-primary border-primary/30", 
  hard: "bg-destructive/10 text-destructive border-destructive/30",
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  const initialGrid = boardToGrid(puzzleData.initialBoard);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/")} 
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <Home className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowDifficultyMenu(!showDifficultyMenu)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border transition-colors",
                  difficultyColors[difficulty]
                )}
              >
                {difficultyLabels[difficulty]}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDifficultyMenu && (
                <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl py-1 z-50 min-w-[140px] overflow-hidden">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(d); setShowDifficultyMenu(false); startNewGame(d); }}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors",
                        d === difficulty && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm">
              <span className="text-muted-foreground">Sai:</span>
              <span className="font-semibold text-destructive">{mistakesCount}</span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-xl py-1 z-50 min-w-[150px] overflow-hidden">
                  <button
                    onClick={() => { startNewGame(difficulty); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {/* Sudoku Board */}
        <div className="bg-card border border-border rounded-xl p-2 shadow-lg">
          <div className="rounded-lg overflow-hidden">
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
                        "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-lg sm:text-xl font-medium transition-all duration-100",
                        "border-r border-b border-border/50",
                        rightBorder && "border-r-2 border-r-border",
                        bottomBorder && "border-b-2 border-b-border",
                        col === 0 && "border-l border-l-border/50",
                        row === 0 && "border-t border-t-border/50",
                        isSelected && "bg-primary/20 ring-2 ring-primary ring-inset",
                        !isSelected && isHighlighted(row, col) && "bg-muted",
                        !isSelected && !isHighlighted(row, col) && isSameValue(row, col) && "bg-primary/10",
                        isConflict(row, col) && "bg-destructive/20 text-destructive animate-shake",
                        isInitial ? "text-foreground font-bold" : "text-primary"
                      )}
                    >
                      {value !== 0 ? value : (
                        cellNotes.length > 0 && (
                          <span className="text-[8px] text-muted-foreground leading-tight">
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
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-center gap-3 w-full max-w-[380px]">
          {/* Notes Toggle */}
          <button 
            onClick={() => setInputMode(inputMode === "notes" ? "fill" : "notes")}
            className={cn(
              "flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl border min-w-[90px] transition-all",
              inputMode === "notes" 
                ? "border-primary bg-primary/10" 
                : "border-border bg-card hover:bg-muted"
            )}
          >
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              inputMode === "notes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {inputMode === "notes" ? "Bật" : "Tắt"}
            </span>
            <div className="flex items-center gap-1.5">
              <PenLine className={cn("w-4 h-4", inputMode === "notes" ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-sm", inputMode === "notes" ? "text-primary" : "text-foreground")}>Ghi chú</span>
            </div>
          </button>

          {/* Timer */}
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-2xl font-mono font-semibold text-foreground tabular-nums">{formatTime()}</span>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>

          {/* Help Toggle */}
          <button 
            onClick={() => setHelpEnabled(!helpEnabled)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl border min-w-[90px] transition-all",
              helpEnabled 
                ? "border-accent bg-accent/10" 
                : "border-border bg-card hover:bg-muted"
            )}
          >
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              helpEnabled ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            )}>
              {helpEnabled ? "Bật" : "Tắt"}
            </span>
            <div className="flex items-center gap-1.5">
              <Lightbulb className={cn("w-4 h-4", helpEnabled ? "text-accent" : "text-muted-foreground")} />
              <span className={cn("text-sm", helpEnabled ? "text-accent" : "text-foreground")}>Gợi ý</span>
            </div>
          </button>
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-[380px]">
          <div className="grid grid-cols-5 gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell || isComplete}
                className="h-14 bg-card hover:bg-primary/10 text-primary text-2xl font-semibold rounded-xl border border-border transition-all disabled:opacity-40 active:scale-95"
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
                className="h-14 bg-card hover:bg-primary/10 text-primary text-2xl font-semibold rounded-xl border border-border transition-all disabled:opacity-40 active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={!selectedCell || isComplete}
              className="h-14 bg-card hover:bg-destructive/10 text-destructive rounded-xl border border-border transition-all disabled:opacity-40 flex items-center justify-center active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Hoàn thành!</h2>
            <p className="text-muted-foreground mb-4">Bạn đã giải xong bài Sudoku</p>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-primary">{formatTime()}</p>
                <p className="text-xs text-muted-foreground">Thời gian</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{mistakesCount}</p>
                <p className="text-xs text-muted-foreground">Lỗi sai</p>
              </div>
            </div>
            <Button 
              onClick={() => startNewGame(difficulty)}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              Chơi tiếp
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
