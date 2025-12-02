"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { PlayerList } from "@/components/PlayerList";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";

interface Player {
  visitorId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  progress?: number;
  errors?: number;
}

interface RoomData {
  code: string;
  hostId: string;
  difficulty: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  puzzleId?: string;
  startedAt?: string;
}

const difficultyLabels: Record<string, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasJoined = useRef(false);

  const { isConnected, emit, on, off, error: socketError } = useSocket({
    visitorId: player?.visitorId || "",
    name: player?.name || "",
    autoConnect: !!player,
  });

  // Debug socket connection
  useEffect(() => {
    console.log("Socket status:", { isConnected, socketError, hasPlayer: !!player });
  }, [isConnected, socketError, player]);

  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Room not found");
      }
      const data = await response.json();
      setRoom(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const joinRoom = useCallback(async (currentRoom: RoomData) => {
    if (!player || hasJoined.current) return;

    const isAlreadyInRoom = currentRoom.players.some(p => p.visitorId === player.visitorId);
    
    if (!isAlreadyInRoom) {
      try {
        const response = await fetch(`/api/rooms/${code}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: player.visitorId,
            name: player.name,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to join room");
        }
        
        await fetchRoom();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
        return;
      }
    }

    hasJoined.current = true;
    console.log("Emitting join_room for", code);
    emit("join_room", { roomCode: code });
    
    // Refetch room data after joining to get latest ready status
    setTimeout(() => fetchRoom(), 500);
  }, [player, code, emit, fetchRoom]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (room && player && isConnected && !hasJoined.current) {
      joinRoom(room);
    }
  }, [room, player, isConnected, joinRoom]);

  useEffect(() => {
    if (!player && !loading && room) {
      setShowNameInput(true);
    }
  }, [player, loading, room]);

  useEffect(() => {
    if (!isConnected) return;

    on<{ visitorId: string; name: string }>("player_joined", () => {
      fetchRoom();
    });

    on<{ visitorId: string }>("player_left", () => {
      fetchRoom();
    });

    on<{ visitorId: string; ready: boolean }>("player_ready", (data) => {
      console.log("Received player_ready:", data);
      setRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.visitorId === data.visitorId ? { ...p, isReady: data.ready } : p
          ),
        };
      });
    });

    on<{ countdown: number }>("game_starting", (data) => {
      setCountdown(data.countdown);
    });

    on<{ puzzle: number[][]; startedAt: string }>("game_started", () => {
      router.push(`/room/${code}/play`);
    });

    return () => {
      off("player_joined");
      off("player_left");
      off("player_ready");
      off("game_starting");
      off("game_started");
    };
  }, [isConnected, on, off, fetchRoom, router, code]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Poll room data every 3s while waiting (backup for socket issues)
  useEffect(() => {
    if (room?.status !== "waiting") return;
    
    const interval = setInterval(() => {
      fetchRoom();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [room?.status, fetchRoom]);

  const handleNameSubmit = async (name: string) => {
    try {
      const response = await fetch("/api/player/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      setGuestName(data.name, data.visitorId);
      setShowNameInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  const handleReadyToggle = useCallback(() => {
    if (!player) return;
    const newReady = !isReady;
    console.log("Setting ready:", newReady, "for room", code);
    setIsReady(newReady);
    emit("set_ready", { roomCode: code, ready: newReady });
  }, [player, isReady, code, emit]);

  const handleStartGame = useCallback(async () => {
    if (!player || !room) return;

    try {
      const response = await fetch(`/api/rooms/${code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start game");
      }

      emit("start_game", { roomCode: code });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    }
  }, [player, room, code, emit]);

  const handleLeaveRoom = useCallback(() => {
    emit("leave_room", { roomCode: code });
    router.push("/");
  }, [code, emit, router]);

  const copyRoomCode = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  const isHost = room?.hostId === player?.visitorId;
  const canStart = room?.players && room.players.length >= 2 && 
    room.players.filter(p => !p.isHost).some(p => p.isReady);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎮</div>
          <p className="text-gray-600">Đang tải phòng...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy phòng</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push("/")}>Về trang chủ</Button>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-center">Nhập tên của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            <NameInput
              onSubmit={handleNameSubmit}
              buttonText="Tham gia phòng"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {countdown !== null && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="text-center text-white">
            <p className="text-xl mb-4">Trò chơi bắt đầu trong...</p>
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-bold"
            >
              {countdown === 0 ? "🎮" : countdown}
            </motion.div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>🏠</span>
                Phòng chờ
              </CardTitle>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {difficultyLabels[room?.difficulty || "medium"]}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Mã phòng</p>
                <p className="text-2xl font-bold font-mono tracking-wider text-gray-900">
                  {code}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={copyRoomCode}>
                📋 Sao chép
              </Button>
            </div>

            {error && (
              <div className="bg-error-50 text-error-700 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <PlayerList
              players={room?.players || []}
              currentPlayerId={player?.visitorId || ""}
              showReadyStatus={room?.status === "waiting"}
              onReadyToggle={!isHost ? handleReadyToggle : undefined}
              isReady={isReady}
            />

            {!isConnected && (
              <div className="mt-4 text-center text-orange-500 text-sm">
                ⚠️ Đang kết nối lại...
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {isHost ? (
            <Button
              fullWidth
              size="lg"
              onClick={handleStartGame}
              disabled={!canStart}
            >
              {canStart ? "🚀 Bắt đầu trò chơi" : "⏳ Đợi người chơi sẵn sàng..."}
            </Button>
          ) : (
            <div className="flex-1 text-center py-3 bg-gray-50 rounded-xl text-gray-600">
              Đợi chủ phòng bắt đầu trò chơi...
            </div>
          )}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowLeaveConfirm(true)}
          >
            🚪
          </Button>
        </div>
      </motion.div>

      <Dialog open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Rời phòng?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Bạn có chắc muốn rời khỏi phòng này không?
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowLeaveConfirm(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleLeaveRoom}>
            Rời phòng
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
