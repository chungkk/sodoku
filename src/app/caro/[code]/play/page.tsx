"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { CaroBoard } from "@/components/CaroBoard";
import { useCaroGame } from "@/hooks/useCaroGame";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import type { CellValue } from "@/lib/caro";

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

  const game = useCaroGame();

  const { isConnected, emit, on, off } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    autoConnect: !!player,
  });

  const fetchRoomData = useCallback(async () => {
    try {
      const res = await fetch(`/api/caro/${code}`);
      if (res.ok) {
        const data = await res.json();
        setRoomPlayers(data.players);
        setGameStatus(data.status);
        
        const me = data.players.find((p: CaroPlayer) => p.visitorId === player?.visitorId);
        if (me) {
          setMySymbol(me.symbol);
        }

        if (data.status === "playing" && data.board) {
          game.loadBoard(data.board, data.currentTurn);
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
  }, [code, player, game]);

  useEffect(() => {
    if (player) {
      fetchRoomData();
    }
  }, [player, fetchRoomData]);

  useEffect(() => {
    if (isConnected && player) {
      emit("caro_join_room", { roomCode: code });
    }
  }, [isConnected, player, code, emit]);

  useEffect(() => {
    if (!isConnected) return;

    on<{ visitorId: string; row: number; col: number; symbol: "X" | "O" }>(
      "caro_move_made",
      (data) => {
        if (data.visitorId !== player?.visitorId) {
          game.makeMove(data.row, data.col, data.symbol);
        }
      }
    );

    on<{ winnerId: string | null; isDraw: boolean }>("caro_game_ended", (data) => {
      setGameStatus("finished");
      if (data.winnerId) {
        const winningPlayer = roomPlayers.find((p) => p.visitorId === data.winnerId);
        setWinner(winningPlayer || null);
      } else {
        setWinner(null);
      }
      setShowResultModal(true);
    });

    on<{ visitorId: string; name: string }>("caro_player_gave_up", () => {
      fetchRoomData();
    });

    return () => {
      off("caro_move_made");
      off("caro_game_ended");
      off("caro_player_gave_up");
    };
  }, [isConnected, on, off, player, game, roomPlayers, fetchRoomData]);

  const handleCellClick = async (row: number, col: number) => {
    if (!player || gameStatus !== "playing" || !mySymbol) return;
    if (game.currentTurn !== mySymbol) return;

    const success = game.makeMove(row, col, mySymbol);
    if (!success) return;

    emit("caro_make_move", {
      roomCode: code,
      row,
      col,
      symbol: mySymbol,
    });

    try {
      const res = await fetch(`/api/caro/${code}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          row,
          col,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "finished") {
          emit("caro_game_ended", {
            roomCode: code,
            winnerId: data.winnerId,
            isDraw: data.isDraw,
          });
        }
      }
    } catch (error) {
      console.error("Failed to make move:", error);
    }
  };

  const handleGiveUp = async () => {
    if (!player) return;

    try {
      const res = await fetch(`/api/caro/${code}/give-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId }),
      });

      if (res.ok) {
        const data = await res.json();
        emit("caro_give_up", {
          roomCode: code,
          winnerId: data.winnerId,
        });
      }
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">❌⭕</div>
          <p className="text-gray-600">Đang tải trò chơi...</p>
        </div>
      </div>
    );
  }

  const me = roomPlayers.find((p) => p.visitorId === player.visitorId);
  const opponent = roomPlayers.find((p) => p.visitorId !== player.visitorId);
  const isMyTurn = game.currentTurn === mySymbol;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Mobile Layout */}
      <div className="md:hidden fixed inset-0 flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">
          <div className="h-14 px-4 flex items-center justify-between">
            <span className="text-2xl">❌⭕</span>
            <span className="text-lg font-bold text-gray-900">Cờ Caro</span>
            <Button variant="ghost" size="sm" onClick={handleBackToRoom}>
              ✕
            </Button>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Room:</span>
              <span className="text-sm font-mono font-bold">{code}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMyTurn ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {isMyTurn ? "Lượt của bạn" : `Lượt ${opponent?.name}`}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className="w-full max-w-[min(100%,calc(100vh-220px))] aspect-square">
            <CaroBoard
              board={game.board}
              onCellClick={handleCellClick}
              disabled={!isMyTurn || gameStatus !== "playing"}
              lastMove={game.lastMove}
              winningCells={game.winningCells}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 pb-safe">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => setShowGiveUpConfirm(true)}
            disabled={gameStatus !== "playing"}
            className="text-red-500"
          >
            Đầu hàng
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cờ Caro</h1>
              <p className="text-gray-600">Mã phòng: <span className="font-mono font-bold">{code}</span></p>
            </div>
            <Button variant="outline" onClick={handleBackToRoom}>
              Về phòng chờ
            </Button>
          </div>

          <div className="grid md:grid-cols-[1fr,350px] gap-6">
            {/* Game Board */}
            <div>
              <Card padding="md">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Lượt của: </span>
                      <span className="font-bold text-lg">
                        {isMyTurn ? "Bạn" : opponent?.name}
                      </span>
                      <span className="ml-2 text-xl">
                        {game.currentTurn === "X" ? "❌" : "⭕"}
                      </span>
                    </div>
                    <Button variant="ghost" onClick={() => setShowGiveUpConfirm(true)} className="text-red-500">
                      Đầu hàng
                    </Button>
                  </div>
                </div>

                <CaroBoard
                  board={game.board}
                  onCellClick={handleCellClick}
                  disabled={!isMyTurn || gameStatus !== "playing"}
                  lastMove={game.lastMove}
                  winningCells={game.winningCells}
                />
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              <Card padding="md">
                <h3 className="font-bold mb-3">Người chơi</h3>
                <div className="space-y-2">
                  {roomPlayers.map((p) => (
                    <div
                      key={p.visitorId}
                      className={`p-3 rounded-lg ${
                        p.visitorId === player.visitorId
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {p.symbol === "X" ? "❌" : "⭕"}
                        </span>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-600">{p.symbol}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-bold mb-2">Luật chơi</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Đánh 5 ô liên tiếp để thắng</li>
                  <li>• Theo chiều ngang, dọc hoặc chéo</li>
                  <li>• Lần lượt đánh theo lượt</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Dialog open={showResultModal} onClose={() => {}}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {winner
              ? winner.visitorId === player.visitorId
                ? "🎉 Bạn thắng!"
                : `${winner.name} thắng!`
              : "🤝 Hòa!"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="text-center">
          {winner?.visitorId === player.visitorId && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
          )}
          {winner && winner.visitorId !== player.visitorId && (
            <div className="text-4xl mb-4">😢</div>
          )}
          {!winner && <div className="text-4xl mb-4">🤝</div>}
        </DialogContent>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleBackToRoom} fullWidth>
            Về phòng chờ
          </Button>
          <Button onClick={handleBackToLobby} fullWidth>
            Về lobby
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Give Up Confirmation */}
      <Dialog open={showGiveUpConfirm} onClose={() => setShowGiveUpConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Đầu hàng?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Bạn có chắc muốn đầu hàng không? Đối thủ sẽ chiến thắng.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowGiveUpConfirm(false)}>
            Tiếp tục chơi
          </Button>
          <Button variant="danger" onClick={handleGiveUp}>
            Đầu hàng
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
