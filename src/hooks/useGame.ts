"use client";

import { useReducer, useCallback, useMemo } from "react";
import {
  Difficulty,
  generatePuzzle,
  isPuzzleComplete,
  calculateFillProgress,
  calculateProgress,
  hasConflict,
  validateSolution,
} from "@/lib/sudoku";

type InputMode = "fill" | "note";

interface GameState {
  puzzle: number[][];
  /** Chỉ có ở chế độ luyện tập. Chơi đối kháng để null vì server không gửi lời giải cho client. */
  solution: number[][] | null;
  userInput: (number | null)[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  highlightedNumber: number | null;
  mode: InputMode;
  difficulty: Difficulty;
  errors: number;
  isComplete: boolean;
  isStarted: boolean;
  history: HistoryEntry[];
  future: HistoryEntry[];
}

interface HistoryEntry {
  row: number;
  col: number;
  prevValue: number | null;
  prevNotes: Set<number>;
}

type GameAction =
  | { type: "START_GAME"; difficulty: Difficulty }
  | { type: "LOAD_PUZZLE"; puzzle: number[][]; solution: number[][] | null; difficulty: Difficulty; userInput?: (number | null)[][] }
  | {
      type: "LOAD_PUZZLE_WITH_STATE";
      puzzle: number[][];
      solution: number[][] | null;
      difficulty: Difficulty;
      userInput: (number | null)[][];
      notes: Set<number>[][];
      errors?: number;
      isComplete?: boolean;
    }
  | { type: "SELECT_CELL"; row: number; col: number }
  | { type: "INPUT_NUMBER"; number: number }
  | { type: "CLEAR_CELL" }
  | { type: "SET_MODE"; mode: InputMode }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET_GAME" };

function isSolved(grid: number[][], solution: number[][] | null): boolean {
  return solution ? isPuzzleComplete(grid, solution) : validateSolution(grid);
}

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

function createZeroGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

const initialState: GameState = {
  puzzle: createZeroGrid(),
  solution: createZeroGrid(),
  userInput: createEmptyUserInput(),
  notes: createEmptyNotes(),
  selectedCell: null,
  highlightedNumber: null,
  mode: "fill",
  difficulty: "medium",
  errors: 0,
  isComplete: false,
  isStarted: false,
  history: [],
  future: [],
};

function highlightNumber(state: GameState, number: number): GameState {
  const currentNumber =
    state.highlightedNumber ??
    (state.selectedCell
      ? state.puzzle[state.selectedCell[0]][state.selectedCell[1]] ||
        state.userInput[state.selectedCell[0]][state.selectedCell[1]]
      : null);
  return {
    ...state,
    selectedCell: null,
    highlightedNumber: currentNumber === number ? null : number,
  };
}

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
        history: [],
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
        history: [],
      };
    }

    case "LOAD_PUZZLE_WITH_STATE": {
      return {
        ...initialState,
        puzzle: action.puzzle,
        solution: action.solution,
        userInput: action.userInput,
        notes: action.notes,
        difficulty: action.difficulty,
        errors: action.errors ?? 0,
        isComplete: action.isComplete ?? false,
        isStarted: true,
        history: [],
      };
    }

    case "SELECT_CELL": {
      const { row, col } = action;
      return { ...state, selectedCell: [row, col], highlightedNumber: null };
    }

    case "INPUT_NUMBER": {
      if (!state.selectedCell) return highlightNumber(state, action.number);
      const [row, col] = state.selectedCell;

      if (state.puzzle[row][col] !== 0) return highlightNumber(state, action.number);

      const historyEntry: HistoryEntry = {
        row,
        col,
        prevValue: state.userInput[row][col],
        prevNotes: new Set(state.notes[row][col]),
      };

      if (state.mode === "note") {
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

        return { ...state, notes: newNotes, history: [...state.history, historyEntry], future: [] };
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

      const complete = isSolved(currentGrid, state.solution);

      return {
        ...state,
        userInput: newUserInput,
        notes: newNotes,
        errors: newErrors,
        isComplete: complete,
        history: [...state.history, historyEntry],
        future: [],
      };
    }

    case "CLEAR_CELL": {
      if (!state.selectedCell) {
        return state.highlightedNumber !== null ? { ...state, highlightedNumber: null } : state;
      }
      const [row, col] = state.selectedCell;

      if (state.puzzle[row][col] !== 0) return state;
      if (state.userInput[row][col] === null && state.notes[row][col].size === 0) return state;

      const historyEntry: HistoryEntry = {
        row,
        col,
        prevValue: state.userInput[row][col],
        prevNotes: new Set(state.notes[row][col]),
      };

      const newUserInput = state.userInput.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? null : cell))
      );

      const newNotes = state.notes.map((r, ri) =>
        r.map((cellNotes, ci) =>
          ri === row && ci === col ? new Set<number>() : cellNotes
        )
      );

      return { ...state, userInput: newUserInput, notes: newNotes, history: [...state.history, historyEntry], future: [] };
    }

    case "SET_MODE": {
      return { ...state, mode: action.mode };
    }

    case "UNDO": {
      if (state.history.length === 0) return state;

      const lastEntry = state.history[state.history.length - 1];
      const { row, col, prevValue, prevNotes } = lastEntry;
      const redoEntry: HistoryEntry = {
        row,
        col,
        prevValue: state.userInput[row][col],
        prevNotes: new Set(state.notes[row][col]),
      };

      const newUserInput = state.userInput.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? prevValue : cell))
      );

      const newNotes = state.notes.map((r, ri) =>
        r.map((cellNotes, ci) =>
          ri === row && ci === col ? new Set(prevNotes) : cellNotes
        )
      );

      return {
        ...state,
        userInput: newUserInput,
        notes: newNotes,
        history: state.history.slice(0, -1),
        future: [...state.future, redoEntry],
        selectedCell: [row, col],
        highlightedNumber: null,
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;

      const nextEntry = state.future[state.future.length - 1];
      const { row, col, prevValue, prevNotes } = nextEntry;
      const undoEntry: HistoryEntry = {
        row,
        col,
        prevValue: state.userInput[row][col],
        prevNotes: new Set(state.notes[row][col]),
      };

      const newUserInput = state.userInput.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? prevValue : cell))
      );

      const newNotes = state.notes.map((r, ri) =>
        r.map((cellNotes, ci) =>
          ri === row && ci === col ? new Set(prevNotes) : cellNotes
        )
      );

      const currentGrid = state.puzzle.map((puzzleRow, r) =>
        puzzleRow.map((cell, c) => (cell !== 0 ? cell : newUserInput[r][c] || 0))
      );

      return {
        ...state,
        userInput: newUserInput,
        notes: newNotes,
        isComplete: isSolved(currentGrid, state.solution),
        history: [...state.history, undoEntry],
        future: state.future.slice(0, -1),
        selectedCell: [row, col],
        highlightedNumber: null,
      };
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
    solution: number[][] | null,
    difficulty: Difficulty,
    userInput?: (number | null)[][]
  ) => {
    dispatch({ type: "LOAD_PUZZLE", puzzle, solution, difficulty, userInput });
  }, []);

  const loadPuzzleWithState = useCallback((
    puzzle: number[][],
    solution: number[][] | null,
    difficulty: Difficulty,
    userInput: (number | null)[][],
    notes: Set<number>[][],
    options?: { errors?: number; isComplete?: boolean }
  ) => {
    dispatch({
      type: "LOAD_PUZZLE_WITH_STATE",
      puzzle,
      solution,
      difficulty,
      userInput,
      notes,
      errors: options?.errors,
      isComplete: options?.isComplete,
    });
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

  const setMode = useCallback((mode: InputMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const toggleMode = useCallback(() => {
    dispatch({ type: "SET_MODE", mode: state.mode === "fill" ? "note" : "fill" });
  }, [state.mode]);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;

  const progress = useMemo(() => {
    if (!state.isStarted) return 0;
    const currentGrid = state.puzzle.map((row, r) =>
      row.map((cell, c) => (cell !== 0 ? cell : state.userInput[r][c] || 0))
    );
    return state.solution
      ? calculateProgress(currentGrid, state.solution, state.puzzle)
      : calculateFillProgress(currentGrid, state.puzzle);
  }, [state.puzzle, state.userInput, state.solution, state.isStarted]);

  return {
    ...state,
    progress,
    canUndo,
    canRedo,
    startGame,
    loadPuzzle,
    loadPuzzleWithState,
    selectCell,
    inputNumber,
    clearCell,
    setMode,
    toggleMode,
    resetGame,
    undo,
    redo,
  };
}

export type { GameState, InputMode };
