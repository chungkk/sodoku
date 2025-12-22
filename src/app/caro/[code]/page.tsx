"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";

interface CaroPlayer {
  visitorId: string;
  name: string;
  symbol: "X" | "O" | null;
  isReady: boolean;
  isConnected: boolean;
}

interface RoomData {
  code: string;
  players: CaroPlayer[];
  status: "waiting" | "playing" | "finished";
}

export default function CaroRoomPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasJoined = useRef(false);

  const { isConnected, emit, on, off } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    autoConnect: !!player,
  });

  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/caro/${code}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Room not found");
      }
      const data = await response.json();
      setRoom({
        code: data.code,
        players: data.players,
        status: data.status,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const joinRoom = useCallback(async (currentRoom: RoomData) => {
    if (!player || hasJoined.current) return;
    
    hasJoined.current = true;

    const isAlreadyInRoom = currentRoom.players.some(p => p.visitorId === player.visitorId);
    
    if (!isAlreadyInRoom) {
      try {
        const response = await fetch(`/api/caro/${code}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: player.visitorId,
            name: player.name,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          hasJoined.current = false;
          throw new Error(data.error || "Failed to join room");
        }
        
        await fetchRoom();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
        return;
      }
    }

    emit("caro_join_room", { roomCode: code });
    setTimeout(() => fetchRoom(), 500);
  }, [player, code, emit, fetchRoom]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (room && player && isConnected && !hasJoined.current) {
      if (room.status === "playing") {
        router.push(`/caro/${code}/play`);
        return;
      }
      joinRoom(room);
    }
  }, [room, player, isConnected, joinRoom, code, router]);

  useEffect(() => {
    if (!player && !loading && room) {
      setShowNameInput(true);
    }
  }, [player, loading, room]);

  useEffect(() => {
    if (!isConnected) return;

    on("caro_player_joined", () => {
      fetchRoom();
    });

    on("caro_room_updated", () => {
      fetchRoom();
    });

    on<{ visitorId: string; ready: boolean }>("caro_player_ready", () => {
      fetchRoom();
    });

    on<{ countdown: number }>("caro_game_starting", (data) => {
      setCountdown(data.countdown);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    on("caro_game_started", () => {
      router.push(`/caro/${code}/play`);
    });

    return () => {
      off("caro_player_joined");
      off("caro_room_updated");
      off("caro_player_ready");
      off("caro_game_starting");
      off("caro_game_started");
    };
  }, [isConnected, on, off, fetchRoom, router, code]);

  const handleToggleReady = () => {
    if (!player || !room) return;

    const me = room.players.find(p => p.visitorId === player.visitorId);
    const newReady = !me?.isReady;

    emit("caro_set_ready", { roomCode: code, ready: newReady });
  };

  const handleStartGame = async () => {
    if (!player) return;

    try {
      const response = await fetch(`/api/caro/${code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to start game");
        return;
      }

      emit("caro_start_game", { roomCode: code });
    } catch (err) {
      setError("Failed to start game");
    }
  };

  const handleLeaveRoom = () => {
    router.push("/caro");
  };

  const handleGuestSubmit = (name: string) => {
    setGuestName(name);
    setShowNameInput(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">❌⭕</div>
          <p className="text-gray-600">Đang tải phòng...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card padding="lg" className="max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold mb-2">Lỗi</h2>
            <p className="text-gray-600 mb-4">{error || "Không tìm thấy phòng"}</p>
            <Button onClick={() => router.push("/caro")}>Về trang chủ</Button>
          </div>
        </Card>
      </div>
    );
  }

  const me = room.players.find(p => p.visitorId === player?.visitorId);
  const isHost = room.players[0]?.visitorId === player?.visitorId;
  const allReady = room.players.length === 2 && room.players.every(p => p.isReady);
  const canStart = isHost && allReady;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phòng Caro</h1>
            <p className="text-gray-600">Mã phòng: <span className="font-mono font-bold">{code}</span></p>
          </div>
          <Button variant="outline" onClick={() => setShowLeaveConfirm(true)}>
            Rời phòng
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Người chơi ({room.players.length}/2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {room.players.map((p, index) => (
                <motion.div
                  key={p.visitorId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    p.visitorId === player?.visitorId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {p.symbol === "X" ? "❌" : p.symbol === "O" ? "⭕" : "🎮"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {p.name}
                          {index === 0 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Host</span>}
                          {p.visitorId === player?.visitorId && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Bạn</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {p.symbol || "Chưa có kí hiệu"}
                        </div>
                      </div>
                    </div>
                    <div>
                      {p.isReady ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Sẵn sàng
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa sẵn sàng</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {room.players.length < 2 && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400">
                  Đang chờ người chơi thứ 2...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Chia sẻ mã phòng <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{code}</span> cho bạn bè</p>
              <p>2. Chờ người chơi thứ 2 vào phòng</p>
              <p>3. Cả hai người bấm "Sẵn sàng"</p>
              <p>4. Chủ phòng bấm "Bắt đầu game"</p>
            </div>

            <div className="pt-4 border-t space-y-3">
              {me && (
                <Button
                  onClick={handleToggleReady}
                  fullWidth
                  variant={me.isReady ? "outline" : "primary"}
                  disabled={room.players.length < 2}
                >
                  {me.isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}
                </Button>
              )}

              {isHost && (
                <Button
                  onClick={handleStartGame}
                  fullWidth
                  disabled={!canStart}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Bắt đầu game
                </Button>
              )}

              {!isHost && allReady && (
                <div className="text-center text-sm text-gray-600">
                  Đang chờ chủ phòng bắt đầu game...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            key={countdown}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            className="text-white text-9xl font-bold"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Name Input Dialog */}
      <Dialog open={showNameInput} onClose={() => router.push("/caro")}>
        <DialogHeader>
          <DialogTitle>Nhập tên của bạn</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <NameInput
            onSubmit={handleGuestSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Rời khỏi phòng?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Bạn có chắc muốn rời khỏi phòng không?
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowLeaveConfirm(false)}>
            Ở lại
          </Button>
          <Button variant="danger" onClick={handleLeaveRoom}>
            Rời phòng
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
