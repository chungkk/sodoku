"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CandyLoader, WrapperRain } from "@/components/candy";
import { toolButtonClass } from "@/components/GameToolbar";
import { CheckIcon, FlagIcon } from "@/components/icons";
import { Leaderboard } from "@/components/Leaderboard";
import { Mascot } from "@/components/Mascot";
import { SudokuStage } from "@/components/SudokuStage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { VersusProgressBar } from "@/components/VersusProgressBar";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { MAX_CHECKS_PER_GAME, validateSolution } from "@/lib/sudoku";
import { apiFetch } from "@/lib/api-client";

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

export default function GamePlayPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { player } = usePlayer();

  const [playersProgress, setPlayersProgress] = useState<PlayerProgress[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pausedBy, setPausedBy] = useState<{ visitorId: string; name: string } | null>(null);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [checksRemaining, setChecksRemaining] = useState(MAX_CHECKS_PER_GAME);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ wrongCount: number; checksRemaining: number } | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);
  const lastEmittedRef = useRef<{ progress: number; errors: number } | null>(null);
  // Đã nộp bài: không nộp lại và không lưu tiến độ nữa, vì server sẽ từ chối
  const submittedRef = useRef(false);

  const game = useGame();
  const timer = useTimer();

  const { isConnected, emit, on, off } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    token: player?.token,
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
      await apiFetch(`/api/games/${code}/state`, {
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

  const flushSaveState = useCallback(() => {
    if (!stateLoaded || gameEnded || !player || submittedRef.current) return;
    lastSaveRef.current = Date.now();

    const state = {
      currentGrid: game.userInput,
      notes: game.notes.map((row) => row.map((cellNotes) => Array.from(cellNotes))),
      elapsedTime: timer.seconds,
      errors: game.errors,
      progress: game.progress,
    };

    saveLocalState(state);
    saveStateToServer(state);
  }, [stateLoaded, gameEnded, player, game.userInput, game.notes, game.errors, game.progress, timer.seconds, saveLocalState, saveStateToServer]);

  const flushSaveRef = useRef(flushSaveState);
  useEffect(() => {
    flushSaveRef.current = flushSaveState;
  }, [flushSaveState]);

  const saveGameState = useCallback(() => {
    if (!stateLoaded || gameEnded || !player || submittedRef.current) return;

    if (Date.now() - lastSaveRef.current < 1000) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        flushSaveRef.current();
      }, 1000);
      return;
    }
    flushSaveState();
  }, [stateLoaded, gameEnded, player, flushSaveState]);

  const fetchGameData = useCallback(async () => {
    try {
      const [roomRes, progressRes, puzzleRes, stateRes] = await Promise.all([
        apiFetch(`/api/rooms/${code}`),
        apiFetch(`/api/games/${code}/progress`),
        apiFetch(`/api/games/${code}/puzzle`),
        player ? apiFetch(`/api/games/${code}/state?visitorId=${player.visitorId}`) : Promise.resolve(null),
      ]);

      if (!roomRes.ok) {
        router.push(`/sudoku/${code}`);
        return;
      }

      const roomData = await roomRes.json();

      if (roomData.status !== "playing" && roomData.status !== "finished") {
        router.push(`/sudoku/${code}`);
        return;
      }

      if (puzzleRes.ok) {
        const puzzleData = await puzzleRes.json();

        let savedState = null;

        if (stateRes && stateRes.ok) {
          const serverState = await stateRes.json();
          if (typeof serverState.checksRemaining === "number") {
            setChecksRemaining(serverState.checksRemaining);
          }
          if (serverState.hasState) {
            savedState = serverState;
          }
        }

        if (!savedState) {
          savedState = loadLocalState();
        }

        const meInRoom = roomData.players?.find(
          (p: { visitorId: string; progress?: number; finishedAt?: string | null }) =>
            p.visitorId === player?.visitorId
        );
        const alreadyFinished =
          savedState?.finished === true ||
          Boolean(meInRoom?.finishedAt) ||
          meInRoom?.progress === 100 ||
          meInRoom?.progress === -1;
        const alreadySolved =
          alreadyFinished && savedState?.gaveUp !== true && meInRoom?.progress !== -1;

        if (alreadyFinished) {
          submittedRef.current = true;
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
            null,
            puzzleData.difficulty,
            userInput,
            notes,
            {
              errors: savedState.errors || 0,
              isComplete: alreadySolved,
            }
          );
          timer.reset(savedState.elapsedTime || 0);
          if (!alreadyFinished && roomData.status === "playing") {
            timer.start();
          }
        } else {
          game.loadPuzzle(
            puzzleData.puzzle,
            null,
            puzzleData.difficulty
          );
          if (!alreadyFinished && roomData.status === "playing") {
            timer.start();
          }
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

      // Vào lại trang giữa lúc đang tạm dừng thì vẫn hiện đúng trạng thái
      if (roomData.status === "playing" && roomData.pausedBy) {
        const pauser = roomData.players.find(
          (p: { visitorId: string }) => p.visitorId === roomData.pausedBy
        );
        setPausedBy({ visitorId: roomData.pausedBy, name: pauser?.name ?? "" });
        timer.pause();
      }

      if (roomData.status === "finished") {
        setGameEnded(true);
        setWinnerId(roomData.winnerId);
        setShowResultsModal(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch game data:", error);
      router.push(`/sudoku/${code}`);
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
        // Đã nộp bài xong thì đồng hồ của mình giữ nguyên, không chạy lại theo người khác
        if (!submittedRef.current) timer.resume();
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

  // Đồng bộ tiến trình và số lỗi ngay lập tức cho đối thủ mỗi khi điền, xóa hoặc hoàn tác
  useEffect(() => {
    if (!stateLoaded || !isConnected || gameEnded || submittedRef.current) return;
    const prev = lastEmittedRef.current;
    if (prev && prev.progress === game.progress && prev.errors === game.errors) return;
    lastEmittedRef.current = { progress: game.progress, errors: game.errors };
    emit("progress_update", {
      roomCode: code,
      progress: game.progress,
      errors: game.errors,
    });
  }, [stateLoaded, isConnected, gameEnded, game.progress, game.errors, code, emit]);

  const handleNumberClick = useCallback(
    (num: number) => {
      if (gameEnded || !player || timer.isPaused) return;
      if (game.mode !== "note") setCheckResult(null);
      game.inputNumber(num);
    },
    [game, gameEnded, player, timer.isPaused]
  );

  const handleClear = useCallback(() => {
    if (gameEnded || timer.isPaused) return;
    setCheckResult(null);
    game.clearCell();
  }, [game, gameEnded, timer.isPaused]);

  const handleUndo = useCallback(() => {
    if (gameEnded || timer.isPaused) return;
    setCheckResult(null);
    game.undo();
  }, [game, gameEnded, timer.isPaused]);

  const handleCheckBoard = useCallback(async () => {
    if (!player || gameEnded || timer.isPaused || game.isComplete || checking || checksRemaining <= 0) {
      return;
    }

    const currentGrid = game.puzzle.map((row, r) =>
      row.map((cell, c) => (cell !== 0 ? cell : game.userInput[r][c] || 0))
    );

    setChecking(true);
    try {
      const response = await apiFetch(`/api/games/${code}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          grid: currentGrid,
        }),
      });
      const data = await response.json();
      if (typeof data.checksRemaining === "number") {
        setChecksRemaining(data.checksRemaining);
      }
      if (response.ok && typeof data.wrongCount === "number") {
        setCheckResult({
          wrongCount: data.wrongCount,
          checksRemaining: data.checksRemaining,
        });
      }
    } catch (error) {
      console.error("Check board error:", error);
    } finally {
      setChecking(false);
    }
  }, [player, gameEnded, timer.isPaused, game.isComplete, game.puzzle, game.userInput, checking, checksRemaining, code]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameEnded || pausedBy || game.isComplete || showGiveUpConfirm || showResultsModal) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }

      if (e.key >= "1" && e.key <= "9") {
        handleNumberClick(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleClear();
      } else if (e.key === "n" || e.key === "N") {
        game.toggleMode();
      } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        if (!game.selectedCell) {
          game.selectCell(0, 0);
          return;
        }
        const [row, col] = game.selectedCell;
        if (e.key === "ArrowUp" && row > 0) game.selectCell(row - 1, col);
        else if (e.key === "ArrowDown" && row < 8) game.selectCell(row + 1, col);
        else if (e.key === "ArrowLeft" && col > 0) game.selectCell(row, col - 1);
        else if (e.key === "ArrowRight" && col < 8) game.selectCell(row, col + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game, gameEnded, pausedBy, showGiveUpConfirm, showResultsModal, handleNumberClick, handleClear, handleUndo]);

  const handleComplete = useCallback(async () => {
    if (!player || gameEnded) return;

    const currentGrid = game.puzzle.map((row, r) =>
      row.map((cell, c) => (cell !== 0 ? cell : game.userInput[r][c] || 0))
    );

    if (submittedRef.current || !validateSolution(currentGrid)) return;
    submittedRef.current = true;

    try {
      const response = await apiFetch(`/api/games/${code}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          grid: currentGrid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        timer.pause();
        if (data.gameEnded) {
          setGameEnded(true);
          setWinnerId(data.winnerId);
          setShowResultsModal(true);
        }
      } else {
        submittedRef.current = false;
      }
    } catch (error) {
      submittedRef.current = false;
      console.error("Complete game error:", error);
    }
  }, [player, game, code, timer, gameEnded]);

  useEffect(() => {
    if (game.isComplete && !gameEnded) {
      handleComplete();
    }
  }, [game.isComplete, gameEnded, handleComplete]);

  const handleGiveUp = useCallback(async () => {
    if (!player) return;

    try {
      const response = await apiFetch(`/api/games/${code}/give-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId }),
      });

      const data = await response.json();

      setShowGiveUpConfirm(false);

      if (data.gameEnded) {
        setGameEnded(true);
        setWinnerId(data.winnerId);
        setShowResultsModal(true);
      } else {
        router.push(`/sudoku/${code}`);
      }
    } catch (error) {
      console.error("Give up error:", error);
    }
  }, [player, code, router]);

  const handlePauseToggle = useCallback(() => {
    if (gameEnded || submittedRef.current) return;
    // Chỉ người đã pause mới được resume
    if (pausedBy && pausedBy.visitorId !== player?.visitorId) return;

    // Server quyết định; đồng hồ và bàn chơi đổi khi nhận sự kiện game_paused
    emit("pause_game", { roomCode: code, paused: !pausedBy });
  }, [gameEnded, player, emit, code, pausedBy]);

  const handleNewGame = useCallback(() => {
    router.push("/sudoku");
  }, [router]);

  const handleBackToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  const winnerName = winnerId
    ? playersProgress.find((p) => p.visitorId === winnerId)?.name
    : null;

  if (loading || !player) {
    return <CandyLoader label="Đang mở khay kẹo…" />;
  }

  const iWon = winnerId === player.visitorId;
  const pausedByMe = pausedBy?.visitorId === player.visitorId;
  const finishedWaiting = game.isComplete && !gameEnded;

  const lockedLabel = pausedByMe
    ? "Bạn đang tạm dừng"
    : pausedBy
      ? `${pausedBy.name} đang tạm dừng`
      : "Đang tạm dừng";

  const say = gameEnded
    ? "Ván này xong rồi!"
    : finishedWaiting
      ? "Giỏi quá! Chờ mọi người xong nhé."
      : pausedByMe
        ? "Bấm nút chạy tiếp khi sẵn sàng nhé."
        : pausedBy
          ? `Chờ ${pausedBy.name} quay lại một chút nhé.`
          : checkResult
            ? checkResult.wrongCount === 0
              ? `Các ô đã điền đều đúng! (còn ${checkResult.checksRemaining} lượt)`
              : `Đang có ${checkResult.wrongCount} ô sai! (còn ${checkResult.checksRemaining} lượt)`
            : game.mode === "note"
              ? "Chạm số để ghi chú vào ô nhé."
              : game.selectedCell
                ? "Chọn số để thả vào ô nào!"
                : "Chạm một ô trống đi nào!";

  return (
    <>
      <SudokuStage
        game={game}
        seconds={timer.seconds}
        locked={timer.isPaused || gameEnded}
        lockedLabel={lockedLabel}
        frozen={gameEnded || game.isComplete}
        paused={!!pausedBy}
        pauseDisabled={gameEnded || game.isComplete || !!(pausedBy && !pausedByMe)}
        onPauseToggle={handlePauseToggle}
        onNumber={handleNumberClick}
        onClear={handleClear}
        onUndo={handleUndo}
        say={say}
        mood={
          pausedBy
            ? "sleep"
            : finishedWaiting
              ? "cheer"
              : checkResult
                ? checkResult.wrongCount === 0
                  ? "cheer"
                  : "wow"
                : game.selectedCell
                  ? "think"
                  : "happy"
        }
        badge={`Phòng ${code}`}
        toolbarColumns={4}
        progress={<VersusProgressBar players={playersProgress} currentPlayerId={player.visitorId} />}
        action={
          <>
            <button
              type="button"
              onClick={handleCheckBoard}
              disabled={timer.isPaused || gameEnded || game.isComplete || checking || checksRemaining <= 0}
              className={toolButtonClass}
              title={`Kiểm tra số ô đang sai (còn ${checksRemaining}/${MAX_CHECKS_PER_GAME} lượt)`}
            >
              <CheckIcon /> Kiểm tra ({checksRemaining})
            </button>
            <button
              type="button"
              onClick={() => setShowGiveUpConfirm(true)}
              disabled={timer.isPaused || gameEnded}
              className={toolButtonClass}
            >
              <FlagIcon /> Bỏ cuộc
            </button>
          </>
        }
      />

      {showResultsModal && iWon && <WrapperRain />}

      <Dialog open={showResultsModal} onClose={() => { }}>
        <DialogHeader className="flex flex-col items-center text-center">
          <Mascot mood={iWon ? "cheer" : winnerId ? "sad" : "think"} className="w-32" />
          <DialogTitle>
            {iWon ? "Bạn thắng rồi!" : winnerName ? `${winnerName} thắng rồi!` : "Ván này không ai thắng"}
          </DialogTitle>
          <p className="mt-1 text-lg font-semibold">
            {iWon ? "Giỏi quá, làm ván nữa nhé!" : winnerId ? "Suýt nữa thôi, phục thù nào!" : "Mọi người đều dừng cuộc chơi, làm ván mới nhé!"}
          </p>
        </DialogHeader>
        <DialogContent>
          <Leaderboard players={playersProgress} currentPlayerId={player.visitorId} gameStatus="finished" />
        </DialogContent>
        <DialogFooter className="flex-col items-center gap-2">
          <Button wrapped fullWidth size="lg" onClick={handleNewGame}>
            Chơi ván mới
          </Button>
          <Button variant="outline" onClick={handleBackToHome} fullWidth>
            Về trang chủ
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showGiveUpConfirm} onClose={() => setShowGiveUpConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Bỏ cuộc thật à?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-lg font-semibold">Bạn sẽ không chơi tiếp được ván này nữa đâu.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleGiveUp}>
            Bỏ cuộc
          </Button>
          <Button onClick={() => setShowGiveUpConfirm(false)}>
            Chơi tiếp
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
