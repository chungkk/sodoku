"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { SudokuBoard } from "@/components/SudokuBoard";
import { NumberPad } from "@/components/NumberPad";
import { Timer } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Target, Clock } from "lucide-react";
import { generatePuzzle, boardToGrid, gridToBoard, validateCell, getConflicts } from "@/lib/sudoku";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard";

interface PuzzleData {
  initialBoard: string;
  solution: string;
  difficulty: Difficulty;
  givens: number;
}

function calculateScore(difficulty: Difficulty, timeMs: number, mistakes: number): number {
  const baseScore: Record<Difficulty, number> = {
    easy: 100,
    medium: 200,
    hard: 300,
  };

  const base = baseScore[difficulty];
  const timePenalty = Math.floor(timeMs / 1000 / 60); // -1 point per minute
  const mistakePenalty = mistakes * 10;

  return Math.max(0, base - timePenalty - mistakePenalty);
}

export default function PracticePage() {
  const router = useRouter();
  const { player } = usePlayer();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [conflicts, setConflicts] = useState<{ row: number; col: number }[]>([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

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
    setFinalScore(null);
  }, []);

  useEffect(() => {
    if (!player) {
      router.push("/");
      return;
    }
    startNewGame(difficulty);
  }, [player, router]);

  useEffect(() => {
    if (!startTime || isComplete) return;

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  useEffect(() => {
    if (!puzzleData || isComplete) return;

    const currentBoard = board.map((row) => row.join("")).join("");
    if (currentBoard === puzzleData.solution) {
      setIsComplete(true);
      const score = calculateScore(puzzleData.difficulty, elapsedMs, mistakesCount);
      setFinalScore(score);
      toast.success(`Hoàn thành! Điểm: ${score}`);
    }
  }, [board, puzzleData, elapsedMs, mistakesCount, isComplete]);

  const handleCellClick = (row: number, col: number) => {
    if (!puzzleData) return;
    const initialGrid = boardToGrid(puzzleData.initialBoard);
    if (initialGrid[row][col] !== 0) {
      setSelectedCell(null);
      return;
    }
    setSelectedCell({ row, col });
    setConflicts([]);
  };

  const handleNumberInput = async (value: number) => {
    if (!selectedCell || !puzzleData) return;
    const { row, col } = selectedCell;
    const initialGrid = boardToGrid(puzzleData.initialBoard);

    if (initialGrid[row][col] !== 0) return;

    const isValid = validateCell(puzzleData.solution, row, col, value);

    if (isValid) {
      setBoard((prev) => {
        const newBoard = prev.map((r) => [...r]);
        newBoard[row][col] = value;
        return newBoard;
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
    setConflicts([]);
  };

  const handleNewGame = () => {
    startNewGame(difficulty);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as Difficulty);
    startNewGame(value as Difficulty);
  };

  if (!player || !puzzleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  const initialGrid = boardToGrid(puzzleData.initialBoard);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Trang chủ
          </Button>
          <h1 className="text-2xl font-bold">Luyện tập</h1>
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Dễ</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="hard">Khó</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full max-w-md">
              <Timer elapsedMs={elapsedMs} />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Sai:</span>
                  <span className="font-bold text-destructive">{mistakesCount}</span>
                </div>
              </div>
            </div>

            <SudokuBoard
              board={board}
              initialBoard={initialGrid}
              selectedCell={selectedCell}
              conflicts={conflicts}
              onCellClick={handleCellClick}
              onNumberInput={handleNumberInput}
              onClear={handleClear}
            />

            <NumberPad
              onNumberClick={handleNumberInput}
              onClear={handleClear}
              disabled={!selectedCell || isComplete}
            />

            <Button variant="outline" onClick={handleNewGame} className="mt-2">
              <RotateCcw className="w-4 h-4 mr-2" />
              Ván mới
            </Button>
          </div>

          {isComplete && finalScore !== null && (
            <Card className="w-full lg:w-80 animate-fadeIn">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <Trophy className="w-6 h-6" />
                  Hoàn thành!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{finalScore}</p>
                  <p className="text-sm text-muted-foreground">điểm</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian</span>
                    <span className="font-mono">
                      {Math.floor(elapsedMs / 1000 / 60)}:{(Math.floor(elapsedMs / 1000) % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số lần sai</span>
                    <span>{mistakesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Độ khó</span>
                    <span className="capitalize">{difficulty}</span>
                  </div>
                </div>
                <Button onClick={handleNewGame} className="w-full">
                  Chơi tiếp
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
