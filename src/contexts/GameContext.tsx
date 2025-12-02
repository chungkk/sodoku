"use client";

import { createContext, useContext, ReactNode } from "react";
import { useGame, GameState, InputMode } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { Difficulty } from "@/lib/sudoku";

interface GameContextType extends GameState {
  progress: number;
  seconds: number;
  isPaused: boolean;
  startGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  inputNumber: (number: number) => void;
  clearCell: () => void;
  toggleNote: (number: number) => void;
  setMode: (mode: InputMode) => void;
  toggleMode: () => void;
  resetGame: () => void;
  togglePause: () => void;
  startNewGame: (difficulty: Difficulty) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGame();
  const timer = useTimer();

  const startNewGame = (difficulty: Difficulty) => {
    game.startGame(difficulty);
    timer.reset(0);
    timer.start();
  };

  const togglePause = () => {
    timer.toggle();
  };

  const resetGame = () => {
    game.resetGame();
    timer.reset(0);
  };

  const value: GameContextType = {
    ...game,
    seconds: timer.seconds,
    isPaused: timer.isPaused,
    togglePause,
    startNewGame,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
