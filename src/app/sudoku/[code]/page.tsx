"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
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
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
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
    hasJoined.current = true;

    const isAlreadyInRoom = currentRoom.players.some(p => p.visitorId === player.visitorId);

    if (!isAlreadyInRoom) {
      try {
        console.log("Joining room via API:", code, player.visitorId);
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
          hasJoined.current = false;
          throw new Error(data.error || "Failed to join room");
        }

        await fetchRoom();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
        return;
      }
    }

    console.log("Emitting join_room for", code);
    emit("join_room", { roomCode: code });
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
      router.push(`/sudoku/${code}/play`);
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

  useEffect(() => {
    if (room?.status === "playing") {
      router.push(`/sudoku/${code}/play`);
      return;
    }

    if (room?.status !== "waiting") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${code}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
          if (data.status === "playing") {
            router.push(`/sudoku/${code}/play`);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [room?.status, code, router]);

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

      setTimeout(() => {
        router.push(`/sudoku/${code}/play`);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    }
  }, [player, room, code, emit, router]);

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
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">🎮</div>
          <p className="text-cyan-400 font-mono uppercase tracking-wider">LOADING ROOM...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-red-400 font-mono uppercase mb-2">ROOM NOT FOUND</h1>
          <p className="text-gray-400 font-mono mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-cyan-500 text-black font-mono uppercase tracking-wider hover:bg-cyan-400 transition-all"
          >
            ▸ GO HOME
          </button>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="max-w-md w-full mx-4 relative">
          <div className="border-2 border-cyan-400 bg-[#0d1117] p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            <h2
              className="text-xl font-bold text-white text-center mb-6 font-mono uppercase tracking-wider"
              style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.6)' }}
            >
              ▸ ENTER YOUR NAME
            </h2>
            <NameInput
              onSubmit={handleNameSubmit}
              buttonText="▸ JOIN ROOM"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Countdown Overlay */}
      {countdown !== null && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <div className="text-center">
            <p className="text-xl mb-4 text-cyan-400 font-mono uppercase tracking-wider">GAME STARTING IN...</p>
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-bold text-cyan-400 font-mono"
              style={{ textShadow: '0 0 40px rgba(0, 255, 255, 0.8)' }}
            >
              {countdown === 0 ? "🎮" : countdown}
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Room Header Card */}
          <div className="border-2 border-cyan-400 bg-[#0d1117] shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-900/30 to-transparent flex items-center justify-between">
              <h1
                className="text-xl font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2"
                style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.6)' }}
              >
                <span>🏠</span> ROOM LOBBY
              </h1>
              <span className="px-3 py-1 border border-cyan-400 text-cyan-400 text-sm font-mono">
                {difficultyLabels[room?.difficulty || "medium"]}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Room Code */}
              <div className="flex items-center justify-between border border-cyan-400/30 bg-cyan-400/5 p-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase">ROOM CODE</p>
                  <p
                    className="text-3xl font-bold font-mono tracking-[0.3em] text-cyan-400"
                    style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
                  >
                    {code}
                  </p>
                </div>
                <button
                  onClick={copyRoomCode}
                  className="px-4 py-2 border border-cyan-400 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-400/10 transition-all"
                >
                  📋 COPY
                </button>
              </div>

              {error && (
                <div className="border border-red-500 bg-red-500/10 text-red-400 px-4 py-2 mb-4 font-mono text-sm">
                  ► {error}
                </div>
              )}

              {/* Players List */}
              <div className="mb-4">
                <h3 className="text-sm text-gray-500 font-mono uppercase mb-3">► PLAYERS ({room?.players.length || 0}/4)</h3>
                <div className="space-y-2">
                  {room?.players.map((p, i) => (
                    <div
                      key={p.visitorId}
                      className={`flex items-center justify-between p-3 border ${p.visitorId === player?.visitorId
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-cyan-400/30'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{p.isHost ? '👑' : '🎮'}</span>
                        <span className="text-white font-mono">{p.name}</span>
                        {p.visitorId === player?.visitorId && (
                          <span className="text-xs text-cyan-400 font-mono">(YOU)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {p.isHost ? (
                          <span className="text-xs text-yellow-400 font-mono">HOST</span>
                        ) : (
                          <span className={`text-xs font-mono ${p.isReady ? 'text-green-400' : 'text-gray-500'}`}>
                            {p.isReady ? '✓ READY' : 'NOT READY'}
                          </span>
                        )}
                        <span className={`w-2 h-2 rounded-full ${p.isConnected ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-gray-600'}`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isConnected && (
                <div className="text-center text-yellow-400 text-sm font-mono py-2">
                  ⚠️ RECONNECTING...
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className={`flex-1 py-4 font-mono uppercase tracking-wider transition-all ${canStart
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {canStart ? '🚀 START GAME' : '⏳ WAITING FOR PLAYERS...'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleReadyToggle}
                  className={`flex-1 py-4 font-mono uppercase tracking-wider transition-all ${isReady
                    ? 'bg-green-500 text-black hover:bg-green-400'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                    }`}
                >
                  {isReady ? '✓ READY!' : '▸ SET READY'}
                </button>
              </>
            )}
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="px-4 py-4 border-2 border-red-500 text-red-400 font-mono hover:bg-red-500/10 transition-all"
            >
              🚪
            </button>
          </div>
        </motion.div>
      </div>

      {/* Leave Confirm Dialog */}
      <Dialog open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <DialogHeader>
          <DialogTitle>LEAVE ROOM?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-400 font-mono">
            Are you sure you want to leave this room?
          </p>
        </DialogContent>
        <DialogFooter>
          <button
            onClick={() => setShowLeaveConfirm(false)}
            className="px-4 py-2 text-gray-500 font-mono text-sm uppercase tracking-wider hover:text-cyan-400"
          >
            [ CANCEL ]
          </button>
          <button
            onClick={handleLeaveRoom}
            className="px-6 py-2 bg-red-500 text-white font-mono uppercase tracking-wider hover:bg-red-400"
          >
            ▸ LEAVE
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
