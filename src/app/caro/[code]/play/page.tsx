"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { CandyLoader, CandyO, CandyX, MascotSay, WrapperRain } from "@/components/candy";
import { CaroBoard } from "@/components/CaroBoard";
import { toolButtonClass } from "@/components/GameToolbar";
import { BackIcon, FlagIcon, PauseIcon, PlayIcon } from "@/components/icons";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useCaroGame } from "@/hooks/useCaroGame";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import type { CellValue } from "@/lib/caro";
import { apiFetch } from "@/lib/api-client";
import type { Board } from "@/lib/caro";

interface CaroPlayer {
  visitorId: string;
  name: string;
  symbol: "X" | "O" | null;
  isReady: boolean;
  isConnected: boolean;
}

export default function CaroPlayPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { player } = usePlayer();

  const [roomPlayers, setRoomPlayers] = useState<CaroPlayer[]>([]);
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "finished">("playing");
  const [showResultModal, setShowResultModal] = useState(false);
  const [winner, setWinner] = useState<CaroPlayer | null>(null);
  const [mySymbol, setMySymbol] = useState<CellValue>(null);
  const [loading, setLoading] = useState(true);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [turnStartedAt, setTurnStartedAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [pausedBy, setPausedBy] = useState<{ visitorId: string; name: string } | null>(null);

  const game = useCaroGame();
  const { loadBoard, applyServerMove } = game;

  const { isConnected, emit, on, off } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    token: player?.token,
    autoConnect: !!player,
  });

  const fetchRoomData = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/caro/${code}`);
      if (res.ok) {
        const data = await res.json();
        setRoomPlayers(data.players);
        setGameStatus(data.status);
        
        const me = data.players.find((p: CaroPlayer) => p.visitorId === player?.visitorId);
        if (me) {
          setMySymbol(me.symbol);
        }

        if (data.board) {
          loadBoard(data.board, data.currentTurn);
        }

        if (data.status === "playing") {
          if (data.turnStartedAt) {
            setTurnStartedAt(new Date(data.turnStartedAt));
          }
          // Vào lại trang giữa lúc đang tạm dừng thì vẫn hiện đúng trạng thái
          const pauser = data.players.find((p: CaroPlayer) => p.visitorId === data.pausedBy);
          setIsPaused(!!pauser);
          setPausedBy(pauser ? { visitorId: pauser.visitorId, name: pauser.name } : null);
        }

        if (data.status === "finished") {
          const winningPlayer = data.winnerId 
            ? data.players.find((p: CaroPlayer) => p.visitorId === data.winnerId)
            : null;
          setWinner(winningPlayer || null);
          setShowResultModal(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    } finally {
      setLoading(false);
    }
  }, [code, player, loadBoard]);

  useEffect(() => {
    if (player) {
      fetchRoomData();
    }
  }, [player, fetchRoomData]);

  useEffect(() => {
    if (isConnected && player) {
      emit("caro_join_room", { roomCode: code });
      // Lấy lại bàn cờ phòng khi bỏ lỡ nước đi lúc mất kết nối
      fetchRoomData();
    }
  }, [isConnected, player, code, emit, fetchRoomData]);

  useEffect(() => {
    if (!isConnected) return;

    on<{
      row: number;
      col: number;
      symbol: "X" | "O";
      board: Board;
      currentTurn: "X" | "O";
      turnStartedAt: string;
    }>("caro_move_made", (data) => {
      applyServerMove(data.board, data.currentTurn, data.row, data.col, data.symbol);
      setTurnStartedAt(new Date(data.turnStartedAt));
    });

    on<{ winnerId: string | null; isDraw: boolean; reason?: string }>("caro_game_ended", (data) => {
      setGameStatus("finished");
      if (data.winnerId) {
        const winningPlayer = roomPlayers.find((p) => p.visitorId === data.winnerId);
        setWinner(winningPlayer || null);
      } else {
        setWinner(null);
      }
      setShowResultModal(true);
    });

    on<{ timedOutPlayer: string; winnerId: string }>("caro_turn_timeout", () => {
      fetchRoomData();
    });

    on<{ visitorId: string; name: string }>("caro_player_gave_up", () => {
      fetchRoomData();
    });

    on<{ board: unknown; currentTurn: "X" | "O"; startedAt: string; turnStartedAt: string }>(
      "caro_game_started",
      (data) => {
        setTurnStartedAt(new Date(data.turnStartedAt));
      }
    );

    on<{ visitorId: string; name: string; paused: boolean; turnStartedAt: string }>("caro_game_paused", (data) => {
      setIsPaused(data.paused);
      if (data.paused) {
        setPausedBy({ visitorId: data.visitorId, name: data.name });
      } else {
        setPausedBy(null);
        // Mốc do server tính lại; đặt về "bây giờ" sẽ làm đồng hồ lệch với server
        setTurnStartedAt(new Date(data.turnStartedAt));
      }
    });

    return () => {
      off("caro_move_made");
      off("caro_game_ended");
      off("caro_turn_timeout");
      off("caro_player_gave_up");
      off("caro_game_started");
      off("caro_game_paused");
    };
  }, [isConnected, on, off, applyServerMove, roomPlayers, fetchRoomData]);

  // Timer countdown effect
  useEffect(() => {
    if (!turnStartedAt || gameStatus !== "playing" || isPaused) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartedAt.getTime()) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turnStartedAt, gameStatus, isPaused]);

  const handlePauseToggle = () => {
    if (gameStatus !== "playing" || !player) return;
    if (pausedBy && pausedBy.visitorId !== player.visitorId) return;
    
    const newPaused = !isPaused;
    emit("caro_pause_game", { roomCode: code, paused: newPaused });
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!player || gameStatus !== "playing" || !mySymbol || isPaused) return;
    if (game.currentTurn !== mySymbol) return;

    const success = game.makeMove(row, col, mySymbol);
    if (!success) return;

    // Reset timer for next turn
    setTurnStartedAt(new Date());

    try {
      const res = await apiFetch(`/api/caro/${code}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          row,
          col,
        }),
      });

      // Server từ chối nước đi: bỏ nước đã hiển thị trước và lấy lại bàn cờ thật
      if (!res.ok) {
        fetchRoomData();
      }
    } catch (error) {
      console.error("Failed to make move:", error);
      fetchRoomData();
    }
  };

  const handleGiveUp = async () => {
    if (!player) return;

    try {
      await apiFetch(`/api/caro/${code}/give-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId }),
      });
    } catch (error) {
      console.error("Failed to give up:", error);
    }

    setShowGiveUpConfirm(false);
  };

  const handleBackToRoom = () => {
    router.push(`/caro/${code}`);
  };

  const handleBackToLobby = () => {
    router.push("/caro");
  };

  if (loading || !player) {
    return <CandyLoader label="Đang mở khay kẹo…" />;
  }

  const opponent = roomPlayers.find((p) => p.visitorId !== player.visitorId);
  const isMyTurn = game.currentTurn === mySymbol;
  const pausedByMe = pausedBy?.visitorId === player.visitorId;
  const iWon = winner?.visitorId === player.visitorId;
  const finished = gameStatus === "finished";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const say = finished
    ? "Ván này xong rồi!"
    : pausedByMe
      ? "Bấm nút chạy tiếp khi sẵn sàng nhé."
      : pausedBy
        ? `Chờ ${pausedBy.name} quay lại một chút nhé.`
        : isMyTurn
          ? "Lượt của bạn, thả kẹo đi nào!"
          : `Chờ ${opponent?.name ?? "đối thủ"} đi nhé.`;

  // Mắt tắc kè nhìn theo nước đi vừa rồi
  const look = game.lastMove
    ? { x: (game.lastMove.col - 7) / 7, y: (game.lastMove.row - 7) / 7 }
    : null;

  const plates = (["X", "O"] as const).map((symbol) => {
    const owner = roomPlayers.find((p) => p.symbol === symbol);
    const active = !finished && game.currentTurn === symbol;
    return (
      <div
        key={symbol}
        className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-full border-[3px] border-ink py-0.5 pl-0.5 pr-3 transition-colors ${active ? "bg-lemon" : "bg-milk"}`}
      >
        {symbol === "X" ? <CandyX className="h-8 w-8 shrink-0" /> : <CandyO className="h-8 w-8 shrink-0" />}
        <span className="truncate font-bold">
          {owner?.visitorId === player.visitorId ? "Bạn" : owner?.name}
        </span>
      </div>
    );
  });

  const clock = (
    <span className={`flex items-center gap-1 rounded-full border-[3px] border-ink py-0.5 pl-3 pr-0.5 font-bold tabular-nums ${timeRemaining <= 30 ? "bg-cherry text-milk" : "bg-milk"}`}>
      {formatTime(timeRemaining)}
      <button
        onClick={handlePauseToggle}
        disabled={finished || !!(pausedBy && !pausedByMe)}
        aria-label={isPaused ? "Chạy tiếp" : "Tạm dừng"}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm text-milk transition-opacity disabled:opacity-40"
      >
        {isPaused ? <PlayIcon /> : <PauseIcon />}
      </button>
    </span>
  );

  return (
    <>
      <div className="mx-auto grid min-h-dvh w-full max-w-5xl grid-rows-[auto_auto_1fr_auto] gap-2 p-2 md:min-h-0 md:grid-cols-[minmax(0,1fr)_20rem] md:grid-rows-[auto_auto_1fr] md:gap-x-8 md:gap-y-4 md:p-6">
        <MascotSay className="md:col-start-2 md:row-start-1" look={look} mood={finished ? (iWon ? "cheer" : "sad") : pausedBy ? "sleep" : isMyTurn ? "happy" : "think"} mascotClassName="w-14 [@media(max-height:720px)]:w-10 [@media(min-height:780px)]:w-24 md:w-24">
          {say}
        </MascotSay>

        <div className="flex flex-col gap-1.5 md:col-start-2 md:row-start-2">
          <div className="flex items-center gap-1.5">{plates}</div>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate rounded-full border-[3px] border-ink bg-milk px-3 py-0.5 font-bold">Phòng {code}</span>
            {clock}
          </div>
        </div>

        <div className="relative flex min-h-0 items-center justify-center pt-12 md:col-start-1 md:row-span-3 md:row-start-1 md:items-start md:pt-0">
          <div className="w-full max-w-[min(100%,calc(100dvh-16rem))] md:max-w-[min(100%,calc(100dvh-10rem))]">
            {isPaused ? (
              <div className="tray flex aspect-square flex-col items-center justify-center gap-1 !rounded-[1.5rem] p-4 text-center">
                <Mascot mood="sleep" className="w-[38%]" />
                <p className="font-display text-2xl">{pausedByMe ? "Bạn đang tạm dừng" : `${pausedBy?.name ?? "Đối thủ"} đang tạm dừng`}</p>
              </div>
            ) : (
              <CaroBoard
                board={game.board}
                onCellClick={handleCellClick}
                disabled={!isMyTurn || finished}
                lastMove={game.lastMove}
                winningCells={game.winningCells}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:col-start-2 md:row-start-3 md:items-start">
          <button onClick={finished ? handleBackToLobby : handleBackToRoom} className={toolButtonClass}>
            <BackIcon /> {finished ? "Chơi ván mới" : "Về phòng chờ"}
          </button>
          <button onClick={() => setShowGiveUpConfirm(true)} disabled={finished} className={toolButtonClass}>
            <FlagIcon /> Đầu hàng
          </button>
        </div>
      </div>

      {showResultModal && iWon && <WrapperRain />}

      <Dialog open={showResultModal} onClose={() => setShowResultModal(false)}>
        <DialogHeader className="flex flex-col items-center text-center">
          <Mascot mood={iWon ? "cheer" : winner ? "sad" : "happy"} className="w-32" />
          <DialogTitle>
            {iWon ? "Bạn thắng rồi!" : winner ? `${winner.name} thắng rồi!` : "Hòa rồi!"}
          </DialogTitle>
          <p className="mt-1 text-lg font-semibold">
            {iWon ? "Giỏi quá, làm ván nữa nhé!" : winner ? "Suýt nữa thôi, phục thù nào!" : "Ngang tài ngang sức, đấu lại nhé!"}
          </p>
        </DialogHeader>
        <DialogFooter className="flex-col items-center gap-2 pt-3">
          <Button wrapped fullWidth size="lg" onClick={handleBackToLobby}>
            Chơi ván mới
          </Button>
          <Button variant="outline" onClick={() => setShowResultModal(false)} fullWidth>
            Xem bàn cờ
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showGiveUpConfirm} onClose={() => setShowGiveUpConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Đầu hàng thật à?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-lg font-semibold">Đối thủ sẽ thắng ván này ngay.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleGiveUp}>
            Đầu hàng
          </Button>
          <Button onClick={() => setShowGiveUpConfirm(false)}>
            Chơi tiếp
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
