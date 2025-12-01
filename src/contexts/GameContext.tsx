"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface GameState {
  puzzle: string | null;
  startTime: number | null;
  status: "waiting" | "playing" | "finished";
  difficulty: string;
}

interface GameContextType {
  gameState: GameState;
  setGameStarted: (puzzle: string, startTime: number, difficulty: string) => void;
  setGameFinished: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  puzzle: null,
  startTime: null,
  status: "waiting",
  difficulty: "medium",
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const setGameStarted = useCallback(
    (puzzle: string, startTime: number, difficulty: string) => {
      setGameState({
        puzzle,
        startTime,
        status: "playing",
        difficulty,
      });
    },
    []
  );

  const setGameFinished = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: "finished",
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialState);
  }, []);

  return (
    <GameContext.Provider
      value={{ gameState, setGameStarted, setGameFinished, resetGame }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
