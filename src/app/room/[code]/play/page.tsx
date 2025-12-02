"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { SudokuBoard } from "@/components/SudokuBoard";
import { NumberPad } from "@/components/NumberPad";
import { Timer, formatTime } from "@/components/Timer";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { calculateProgress, findConflicts, isPuzzleComplete } from "@/lib/sudoku";

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

  const game = useGame();
  const timer = useTimer();

  const { isConnected, emit, on, off } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    autoConnect: !!player,
  });

  const fetchGameData = useCallback(async () => {
    try {
      const [roomRes, progressRes, puzzleRes] = await Promise.all([
        fetch(`/api/rooms/${code}`),
        fetch(`/api/games/${code}/progress`),
        fetch(`/api/games/${code}/puzzle`),
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
        game.loadPuzzle(
          puzzleData.puzzle,
          puzzleData.solution,
          puzzleData.difficulty
        );
        timer.start();
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
  }, [code, router]);

  useEffect(() => {
    if (player) {
      fetchGameData();
    }
  }, [player, fetchGameData]);

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

    return () => {
      off("progress_update");
      off("player_completed");
      off("player_gave_up");
      off("game_ended");
      off("player_disconnected");
      off("player_reconnected");
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
    if (gameEnded) return;
    game.clearCell();
  }, [game, gameEnded]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <h1 className="text-xl font-bold text-gray-900">Phòng {code}</h1>
            <Timer
              seconds={timer.seconds}
              isPaused={gameEnded}
              onPauseToggle={() => {}}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[400px] mx-auto mb-6"
          >
            <SudokuBoard
              puzzle={game.puzzle}
              userInput={game.userInput}
              notes={game.notes}
              selectedCell={game.selectedCell}
              onCellClick={game.selectCell}
              isPaused={gameEnded}
            />
          </motion.div>

          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Tiến độ: {game.progress}%</span>
              <span>Lỗi: {game.errors}</span>
            </div>

            <NumberPad
              onNumberClick={handleNumberClick}
              onClear={handleClear}
              onToggleNoteMode={game.toggleMode}
              isNoteMode={game.mode === "note"}
              selectedNumber={null}
              disabled={gameEnded}
            />

            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowGiveUpConfirm(true)}
              disabled={gameEnded}
            >
              🏳️ Bỏ cuộc
            </Button>
          </Card>
        </div>

        <div className="lg:w-80">
          <Card padding="md">
            <Leaderboard
              players={playersProgress}
              currentPlayerId={player.visitorId}
              gameStatus={gameEnded ? "finished" : "playing"}
            />
          </Card>
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
