"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { SudokuBoard } from "@/components/SudokuBoard";
import { NumberPad } from "@/components/NumberPad";
import { GameToolbar } from "@/components/GameToolbar";
import { formatTime } from "@/components/Timer";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { VersusProgressBar } from "@/components/VersusProgressBar";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { calculateProgress, findConflicts, isPuzzleComplete } from "@/lib/sudoku";

const GAME_STATE_KEY = "sudoku_game_state_";

interface PlayerProgress {
  visitorId: string;
  name: string;
  progress: number;
  errors: number;
  isConnected: boolean;
  finished: boolean;
  gaveUp: boolean;
  time: number | null;
}

interface GameData {
  puzzle: number[][];
  solution: number[][];
  difficulty: string;
  startedAt: string;
}

export default function GamePlayPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { player } = usePlayer();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playersProgress, setPlayersProgress] = useState<PlayerProgress[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pausedBy, setPausedBy] = useState<{ visitorId: string; name: string } | null>(null);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  const game = useGame();
  const timer = useTimer();

  const { isConnected, emit, on, off } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    autoConnect: !!player,
  });

  const getLocalStorageKey = useCallback(() => {
    return `${GAME_STATE_KEY}${code}_${player?.visitorId}`;
  }, [code, player?.visitorId]);

  const loadLocalState = useCallback(() => {
    try {
      const stored = localStorage.getItem(getLocalStorageKey());
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load local state:", error);
    }
    return null;
  }, [getLocalStorageKey]);

  const saveLocalState = useCallback((state: {
    currentGrid: (number | null)[][];
    notes: number[][][];
    elapsedTime: number;
    errors: number;
    progress: number;
  }) => {
    try {
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save local state:", error);
    }
  }, [getLocalStorageKey]);

  const saveStateToServer = useCallback(async (state: {
    currentGrid: (number | null)[][];
    notes: number[][][];
    elapsedTime: number;
    errors: number;
    progress: number;
  }) => {
    if (!player) return;

    try {
      await fetch(`/api/games/${code}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          ...state,
        }),
      });
    } catch (error) {
      console.error("Failed to save state to server:", error);
    }
  }, [code, player]);

  const saveGameState = useCallback(() => {
    if (!stateLoaded || gameEnded || !player) return;

    const now = Date.now();
    if (now - lastSaveRef.current < 1000) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveGameState();
      }, 1000);
      return;
    }
    lastSaveRef.current = now;

    const notesArray = game.notes.map(row => 
      row.map(cellNotes => Array.from(cellNotes))
    );

    const state = {
      currentGrid: game.userInput,
      notes: notesArray,
      elapsedTime: timer.seconds,
      errors: game.errors,
      progress: game.progress,
    };

    saveLocalState(state);
    saveStateToServer(state);
  }, [stateLoaded, gameEnded, player, game.userInput, game.notes, game.errors, game.progress, timer.seconds, saveLocalState, saveStateToServer]);

  const fetchGameData = useCallback(async () => {
    try {
      const [roomRes, progressRes, puzzleRes, stateRes] = await Promise.all([
        fetch(`/api/rooms/${code}`),
        fetch(`/api/games/${code}/progress`),
        fetch(`/api/games/${code}/puzzle`),
        player ? fetch(`/api/games/${code}/state?visitorId=${player.visitorId}`) : Promise.resolve(null),
      ]);

      if (!roomRes.ok) {
        router.push(`/room/${code}`);
        return;
      }

      const roomData = await roomRes.json();

      if (roomData.status !== "playing" && roomData.status !== "finished") {
        router.push(`/room/${code}`);
        return;
      }

      if (puzzleRes.ok) {
        const puzzleData = await puzzleRes.json();
        
        let savedState = null;
        
        if (stateRes && stateRes.ok) {
          const serverState = await stateRes.json();
          if (serverState.hasState) {
            savedState = serverState;
          }
        }
        
        if (!savedState) {
          savedState = loadLocalState();
        }

        if (savedState && savedState.currentGrid && savedState.currentGrid.length > 0) {
          const userInput = savedState.currentGrid.map((row: (number | null)[]) =>
            row.map((cell: number | null) => (cell === 0 ? null : cell))
          );
          
          const notes: Set<number>[][] = savedState.notes && savedState.notes.length > 0
            ? savedState.notes.map((row: number[][]) =>
                row.map((cellNotes: number[]) => new Set(cellNotes))
              )
            : Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>()));

          game.loadPuzzleWithState(
            puzzleData.puzzle,
            puzzleData.solution,
            puzzleData.difficulty,
            userInput,
            notes
          );
          timer.reset(savedState.elapsedTime || 0);
          timer.start();
        } else {
          game.loadPuzzle(
            puzzleData.puzzle,
            puzzleData.solution,
            puzzleData.difficulty
          );
          timer.start();
        }
        
        setStateLoaded(true);
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setPlayersProgress(progressData.players.map((p: PlayerProgress) => ({
          ...p,
          finished: p.progress === 100,
          gaveUp: p.progress === -1,
        })));
      }

      if (roomData.status === "finished") {
        setGameEnded(true);
        setWinnerId(roomData.winnerId);
        setShowResultsModal(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch game data:", error);
      router.push(`/room/${code}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, router, player, loadLocalState]);

  useEffect(() => {
    if (player) {
      fetchGameData();
    }
  }, [player, fetchGameData]);

  useEffect(() => {
    if (stateLoaded && !gameEnded) {
      saveGameState();
    }
  }, [game.userInput, game.notes, game.errors, stateLoaded, gameEnded, saveGameState]);

  useEffect(() => {
    if (stateLoaded && !gameEnded && !timer.isPaused) {
      const interval = setInterval(() => {
        saveGameState();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [stateLoaded, gameEnded, timer.isPaused, saveGameState]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && player) {
      emit("reconnect_game", { roomCode: code });
    }
  }, [isConnected, player, code, emit]);

  useEffect(() => {
    if (!isConnected) return;

    on<{ visitorId: string; name: string; progress: number; errors: number }>(
      "progress_update",
      (data) => {
        setPlayersProgress((prev) =>
          prev.map((p) =>
            p.visitorId === data.visitorId
              ? { ...p, progress: data.progress, errors: data.errors }
              : p
          )
        );
      }
    );

    on<{ visitorId: string; name: string; time: number; errors: number }>(
      "player_completed",
      (data) => {
        setPlayersProgress((prev) =>
          prev.map((p) =>
            p.visitorId === data.visitorId
              ? { ...p, progress: 100, finished: true, time: data.time, errors: data.errors }
              : p
          )
        );
      }
    );

    on<{ visitorId: string; name: string }>("player_gave_up", (data) => {
      setPlayersProgress((prev) =>
        prev.map((p) =>
          p.visitorId === data.visitorId ? { ...p, progress: -1, gaveUp: true } : p
        )
      );
    });

    on<{ winnerId: string; reason: string }>("game_ended", (data) => {
      setGameEnded(true);
      setWinnerId(data.winnerId);
      timer.pause();
      setShowResultsModal(true);
    });

    on<{ visitorId: string; name: string; timeout: number }>(
      "player_disconnected",
      (data) => {
        setPlayersProgress((prev) =>
          prev.map((p) =>
            p.visitorId === data.visitorId ? { ...p, isConnected: false } : p
          )
        );
      }
    );

    on<{ visitorId: string; name: string }>("player_reconnected", (data) => {
      setPlayersProgress((prev) =>
        prev.map((p) =>
          p.visitorId === data.visitorId ? { ...p, isConnected: true } : p
        )
      );
    });

    on<{ visitorId: string; name: string; paused: boolean }>("game_paused", (data) => {
      if (data.paused) {
        setPausedBy({ visitorId: data.visitorId, name: data.name });
        timer.pause();
      } else {
        setPausedBy(null);
        timer.resume();
      }
    });

    return () => {
      off("progress_update");
      off("player_completed");
      off("player_gave_up");
      off("game_ended");
      off("player_disconnected");
      off("player_reconnected");
      off("game_paused");
    };
  }, [isConnected, on, off, timer]);

  const handleNumberClick = useCallback(
    (num: number) => {
      if (gameEnded || !player) return;

      if (game.mode === "note") {
        game.toggleNote(num);
      } else {
        game.inputNumber(num);

        const currentGrid = game.puzzle.map((row, r) =>
          row.map((cell, c) =>
            cell !== 0 ? cell : r === game.selectedCell?.[0] && c === game.selectedCell?.[1]
              ? num
              : game.userInput[r][c] || 0
          )
        );

        const progress = calculateProgress(currentGrid, game.solution);

        emit("progress_update", {
          roomCode: code,
          progress,
          errors: game.errors,
        });

        if (game.selectedCell) {
          const [row, col] = game.selectedCell;
          const conflicts = findConflicts(currentGrid, row, col, num);

          emit("cell_update", {
            roomCode: code,
            row,
            col,
            value: num,
            valid: conflicts.length === 0,
            conflicts,
          });
        }
      }
    },
    [game, gameEnded, player, code, emit]
  );

  const handleClear = useCallback(() => {
    if (gameEnded || timer.isPaused) return;
    game.clearCell();
  }, [game, gameEnded, timer.isPaused]);

  const handleUndo = useCallback(() => {
    if (gameEnded || timer.isPaused) return;
    game.undo();
  }, [game, gameEnded, timer.isPaused]);

  const handleHint = useCallback(() => {
    if (gameEnded || timer.isPaused || hintsRemaining === 0) return;
    const used = game.useHint();
    if (used) {
      setHintsRemaining((prev) => prev - 1);
    }
  }, [game, gameEnded, timer.isPaused, hintsRemaining]);

  const handleComplete = useCallback(async () => {
    if (!player || gameEnded) return;

    const currentGrid = game.puzzle.map((row, r) =>
      row.map((cell, c) => (cell !== 0 ? cell : game.userInput[r][c] || 0))
    );

    if (!isPuzzleComplete(currentGrid, game.solution)) return;

    try {
      const response = await fetch(`/api/games/${code}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          grid: currentGrid,
          time: timer.seconds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        timer.pause();
        emit("complete_puzzle", {
          roomCode: code,
          grid: currentGrid,
          time: timer.seconds,
          errors: game.errors,
          gameEnded: data.gameEnded,
          winnerId: data.winnerId,
        });

        if (data.gameEnded) {
          setGameEnded(true);
          setWinnerId(data.winnerId);
          setShowResultsModal(true);
        }
      }
    } catch (error) {
      console.error("Complete game error:", error);
    }
  }, [player, game, code, timer, emit, gameEnded]);

  useEffect(() => {
    if (game.isComplete && !gameEnded) {
      handleComplete();
    }
  }, [game.isComplete, gameEnded, handleComplete]);

  const handleGiveUp = useCallback(async () => {
    if (!player) return;

    try {
      const response = await fetch(`/api/games/${code}/give-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId }),
      });

      const data = await response.json();

      emit("give_up", {
        roomCode: code,
        gameEnded: data.gameEnded,
        winnerId: data.winnerId,
      });

      setShowGiveUpConfirm(false);

      if (data.gameEnded) {
        setGameEnded(true);
        setWinnerId(data.winnerId);
        setShowResultsModal(true);
      } else {
        router.push(`/room/${code}`);
      }
    } catch (error) {
      console.error("Give up error:", error);
    }
  }, [player, code, emit, router]);

  const handlePauseToggle = useCallback(() => {
    if (gameEnded) return;
    // Chỉ người đã pause mới được resume
    if (pausedBy && pausedBy.visitorId !== player?.visitorId) return;
    
    const newPaused = !timer.isPaused;
    if (newPaused) {
      timer.pause();
      setPausedBy({ visitorId: player?.visitorId || "", name: player?.name || "" });
    } else {
      timer.resume();
      setPausedBy(null);
    }
    emit("pause_game", { roomCode: code, paused: newPaused });
  }, [gameEnded, timer, player, emit, code, pausedBy]);

  const handleBackToRoom = useCallback(() => {
    router.push(`/room/${code}`);
  }, [router, code]);

  const handleBackToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  const winnerName = winnerId
    ? playersProgress.find((p) => p.visitorId === winnerId)?.name
    : null;

  if (loading || !player) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎮</div>
          <p className="text-gray-600">Đang tải trò chơi...</p>
        </div>
      </div>
    );
  }

  const difficultyLabels: Record<string, string> = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
  };

  const selectedValue = game.selectedCell
    ? (game.puzzle[game.selectedCell[0]][game.selectedCell[1]] !== 0
        ? game.puzzle[game.selectedCell[0]][game.selectedCell[1]]
        : game.userInput[game.selectedCell[0]][game.selectedCell[1]])
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Mobile: Fixed Full Layout */}
      <div className="md:hidden fixed inset-0 top-16 flex flex-col bg-white z-30">
        {/* Top Section: Header + Versus + Pause */}
        <div className="flex-shrink-0 border-b border-gray-100">
          {/* Header */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Room: <span className="text-[#1e3a5f] font-medium">{code}</span></span>
              <span className="text-gray-500">Mistakes: <span className="text-[#1e3a5f] font-medium">{game.errors}/3</span></span>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Time: <span className="text-[#1e3a5f] font-medium">{formatTime(timer.seconds)}</span></span>
                <button
                  onClick={handlePauseToggle}
                  disabled={!!(pausedBy && pausedBy.visitorId !== player?.visitorId)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-50"
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
          </div>

          {/* Versus Progress Bar */}
          {playersProgress.length >= 2 && (
            <VersusProgressBar
              players={playersProgress}
              currentPlayerId={player.visitorId}
            />
          )}

          {/* Pause overlay message */}
          {pausedBy && (
            <div className="px-4 pb-2">
              <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-center">
                <span className="text-amber-800 font-medium text-xs">
                  {pausedBy.visitorId === player?.visitorId 
                    ? "Bạn đã tạm dừng trò chơi" 
                    : `${pausedBy.name} đã tạm dừng trò chơi`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Sudoku Board */}
        <div className="flex-1 flex items-center justify-center px-3 overflow-hidden">
          <div className="w-full max-w-[400px]">
            <SudokuBoard
              puzzle={game.puzzle}
              userInput={game.userInput}
              notes={game.notes}
              selectedCell={game.selectedCell}
              onCellClick={game.selectCell}
              isPaused={timer.isPaused || gameEnded}
            />
          </div>
        </div>

        {/* Bottom Section: Toolbar + NumberPad + Give up + Footer */}
        <div className="flex-shrink-0 border-t border-gray-100">
          <GameToolbar
            onUndo={handleUndo}
            onErase={handleClear}
            onToggleNotes={game.toggleMode}
            isNotesMode={game.mode === "note"}
            canUndo={game.canUndo}
            disabled={timer.isPaused || gameEnded}
          />
          <NumberPad
            onNumberClick={handleNumberClick}
            selectedNumber={selectedValue}
            disabled={timer.isPaused || gameEnded}
          />
          <div className="px-4 py-1">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowGiveUpConfirm(true)}
              disabled={timer.isPaused || gameEnded}
              className="text-red-500 text-sm"
            >
              Bỏ cuộc
            </Button>
          </div>
          <div className="text-center pb-2 text-xs text-gray-400">
            🧩 Sudoku Game
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Room: <span className="text-[#1e3a5f] font-medium">{code}</span></span>
            <span className="text-gray-500">Mistakes: <span className="text-[#1e3a5f] font-medium">{game.errors}/3</span></span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Time: <span className="text-[#1e3a5f] font-medium">{formatTime(timer.seconds)}</span></span>
              <button
                onClick={handlePauseToggle}
                disabled={!!(pausedBy && pausedBy.visitorId !== player?.visitorId)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-50"
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
        </div>

        {/* Versus Progress Bar */}
        {playersProgress.length >= 2 && (
          <VersusProgressBar
            players={playersProgress}
            currentPlayerId={player.visitorId}
          />
        )}

        {/* Pause overlay message */}
        {pausedBy && (
          <div className="px-4 pb-2">
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg text-center">
              <span className="text-amber-800 font-medium text-sm">
                {pausedBy.visitorId === player?.visitorId 
                  ? "Bạn đã tạm dừng trò chơi" 
                  : `${pausedBy.name} đã tạm dừng trò chơi`}
              </span>
            </div>
          </div>
        )}

        {/* Sudoku Board */}
        <div className="flex justify-center px-3">
          <div className="w-full max-w-[400px]">
            <SudokuBoard
              puzzle={game.puzzle}
              userInput={game.userInput}
              notes={game.notes}
              selectedCell={game.selectedCell}
              onCellClick={game.selectCell}
              isPaused={timer.isPaused || gameEnded}
            />
          </div>
        </div>

        {/* Toolbar + Number Pad */}
        <div className="pb-4">
          <GameToolbar
            onUndo={handleUndo}
            onErase={handleClear}
            onToggleNotes={game.toggleMode}
            isNotesMode={game.mode === "note"}
            canUndo={game.canUndo}
            disabled={timer.isPaused || gameEnded}
          />
          <NumberPad
            onNumberClick={handleNumberClick}
            selectedNumber={selectedValue}
            disabled={timer.isPaused || gameEnded}
          />
        </div>
      </div>

      <Dialog open={showResultsModal} onClose={() => {}}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {winnerId === player.visitorId ? "🎉 Chúc mừng!" : "🏁 Trò chơi kết thúc!"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="text-center">
          {winnerId === player.visitorId ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
          ) : (
            <div className="text-4xl mb-4">🎮</div>
          )}

          <p className="text-gray-600 mb-4">
            {winnerName
              ? `${winnerName} đã chiến thắng!`
              : "Trò chơi đã kết thúc"}
          </p>

          <Card padding="md" className="text-left">
            <Leaderboard
              players={playersProgress}
              currentPlayerId={player.visitorId}
              gameStatus="finished"
            />
          </Card>
        </DialogContent>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleBackToRoom} fullWidth>
            Về phòng chờ
          </Button>
          <Button onClick={handleBackToHome} fullWidth>
            Về trang chủ
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showGiveUpConfirm} onClose={() => setShowGiveUpConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Bỏ cuộc?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Bạn có chắc muốn bỏ cuộc không? Bạn sẽ không thể tiếp tục trò chơi này.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowGiveUpConfirm(false)}>
            Tiếp tục chơi
          </Button>
          <Button variant="danger" onClick={handleGiveUp}>
            Bỏ cuộc
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
