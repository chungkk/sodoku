"use client";

import { useReducer, useCallback, useMemo } from "react";
import {
  Difficulty,
  generatePuzzle,
  isPuzzleComplete,
  calculateProgress,
  hasConflict,
} from "@/lib/sudoku";

type InputMode = "fill" | "note";

interface GameState {
  puzzle: number[][];
  solution: number[][];
  userInput: (number | null)[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  mode: InputMode;
  difficulty: Difficulty;
  errors: number;
  isComplete: boolean;
  isStarted: boolean;
}

type GameAction =
  | { type: "START_GAME"; difficulty: Difficulty }
  | { type: "LOAD_PUZZLE"; puzzle: number[][]; solution: number[][]; difficulty: Difficulty; userInput?: (number | null)[][] }
  | { type: "SELECT_CELL"; row: number; col: number }
  | { type: "INPUT_NUMBER"; number: number }
  | { type: "CLEAR_CELL" }
  | { type: "TOGGLE_NOTE"; number: number }
  | { type: "SET_MODE"; mode: InputMode }
  | { type: "RESET_GAME" };

function createEmptyNotes(): Set<number>[][] {
  return Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => new Set<number>())
    );
}

function createEmptyUserInput(): (number | null)[][] {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));
}

const initialState: GameState = {
  puzzle: Array(9).fill(Array(9).fill(0)),
  solution: Array(9).fill(Array(9).fill(0)),
  userInput: createEmptyUserInput(),
  notes: createEmptyNotes(),
  selectedCell: null,
  mode: "fill",
  difficulty: "medium",
  errors: 0,
  isComplete: false,
  isStarted: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const { grid, solution } = generatePuzzle(action.difficulty);
      return {
        ...initialState,
        puzzle: grid,
        solution,
        userInput: createEmptyUserInput(),
        notes: createEmptyNotes(),
        difficulty: action.difficulty,
        isStarted: true,
      };
    }

    case "LOAD_PUZZLE": {
      return {
        ...initialState,
        puzzle: action.puzzle,
        solution: action.solution,
        userInput: action.userInput || createEmptyUserInput(),
        notes: createEmptyNotes(),
        difficulty: action.difficulty,
        isStarted: true,
      };
    }

    case "SELECT_CELL": {
      const { row, col } = action;
      if (state.puzzle[row][col] !== 0) {
        return { ...state, selectedCell: [row, col] };
      }
      return { ...state, selectedCell: [row, col] };
    }

    case "INPUT_NUMBER": {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;

      if (state.puzzle[row][col] !== 0) return state;

      if (state.mode === "note") {
        const newNotes = state.notes.map((r, ri) =>
          r.map((cellNotes, ci) => {
            if (ri === row && ci === col) {
              const updated = new Set(cellNotes);
              if (updated.has(action.number)) {
                updated.delete(action.number);
              } else {
                updated.add(action.number);
              }
              return updated;
            }
            return cellNotes;
          })
        );

        return { ...state, notes: newNotes };
      }

      const newUserInput = state.userInput.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? action.number : cell))
      );

      const newNotes = state.notes.map((r, ri) =>
        r.map((cellNotes, ci) =>
          ri === row && ci === col ? new Set<number>() : cellNotes
        )
      );

      const currentGrid = state.puzzle.map((puzzleRow, r) =>
        puzzleRow.map((cell, c) =>
          cell !== 0 ? cell : newUserInput[r][c] || 0
        )
      );

      const isError = hasConflict(currentGrid, row, col, action.number);
      const newErrors = isError ? state.errors + 1 : state.errors;

      const complete = isPuzzleComplete(currentGrid, state.solution);

      return {
        ...state,
        userInput: newUserInput,
        notes: newNotes,
        errors: newErrors,
        isComplete: complete,
      };
    }

    case "CLEAR_CELL": {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;

      if (state.puzzle[row][col] !== 0) return state;

      const newUserInput = state.userInput.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? null : cell))
      );

      const newNotes = state.notes.map((r, ri) =>
        r.map((cellNotes, ci) =>
          ri === row && ci === col ? new Set<number>() : cellNotes
        )
      );

      return { ...state, userInput: newUserInput, notes: newNotes };
    }

    case "TOGGLE_NOTE": {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;

      if (state.puzzle[row][col] !== 0) return state;
      if (state.userInput[row][col] !== null) return state;

      const newNotes = state.notes.map((r, ri) =>
        r.map((cellNotes, ci) => {
          if (ri === row && ci === col) {
            const updated = new Set(cellNotes);
            if (updated.has(action.number)) {
              updated.delete(action.number);
            } else {
              updated.add(action.number);
            }
            return updated;
          }
          return cellNotes;
        })
      );

      return { ...state, notes: newNotes };
    }

    case "SET_MODE": {
      return { ...state, mode: action.mode };
    }

    case "RESET_GAME": {
      return initialState;
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((difficulty: Difficulty) => {
    dispatch({ type: "START_GAME", difficulty });
  }, []);

  const loadPuzzle = useCallback((
    puzzle: number[][],
    solution: number[][],
    difficulty: Difficulty,
    userInput?: (number | null)[][]
  ) => {
    dispatch({ type: "LOAD_PUZZLE", puzzle, solution, difficulty, userInput });
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    dispatch({ type: "SELECT_CELL", row, col });
  }, []);

  const inputNumber = useCallback((number: number) => {
    dispatch({ type: "INPUT_NUMBER", number });
  }, []);

  const clearCell = useCallback(() => {
    dispatch({ type: "CLEAR_CELL" });
  }, []);

  const toggleNote = useCallback((number: number) => {
    dispatch({ type: "TOGGLE_NOTE", number });
  }, []);

  const setMode = useCallback((mode: InputMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const toggleMode = useCallback(() => {
    dispatch({ type: "SET_MODE", mode: state.mode === "fill" ? "note" : "fill" });
  }, [state.mode]);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const progress = useMemo(() => {
    if (!state.isStarted) return 0;
    const currentGrid = state.puzzle.map((row, r) =>
      row.map((cell, c) => (cell !== 0 ? cell : state.userInput[r][c] || 0))
    );
    return calculateProgress(currentGrid, state.solution);
  }, [state.puzzle, state.userInput, state.solution, state.isStarted]);

  return {
    ...state,
    progress,
    startGame,
    loadPuzzle,
    selectCell,
    inputNumber,
    clearCell,
    toggleNote,
    setMode,
    toggleMode,
    resetGame,
  };
}

export type { GameState, InputMode };
