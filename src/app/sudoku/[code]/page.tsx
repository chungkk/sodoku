"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CandyLoader, MascotSay } from "@/components/candy";
import { DoorIcon } from "@/components/icons";
import { NameInput } from "@/components/NameInput";
import { CenterScreen, CountdownOverlay, EmptySlot, PlayerSlot, RoomCode } from "@/components/room";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import { apiFetch, requestGuestSession } from "@/lib/api-client";

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
    token: player?.token,
    autoConnect: !!player,
  });

  useEffect(() => {
    console.log("Socket status:", { isConnected, socketError, hasPlayer: !!player });
  }, [isConnected, socketError, player]);

  const fetchRoom = useCallback(async () => {
    try {
      const response = await apiFetch(`/api/rooms/${code}`);
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
        const response = await apiFetch(`/api/rooms/${code}/join`, {
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

  // Đang đếm ngược thì chờ đếm xong rồi mới chuyển sang màn chơi
  const isCountingDown = countdown !== null && countdown > 0;

  useEffect(() => {
    if (room?.status === "playing") {
      if (isCountingDown) return;
      router.push(`/sudoku/${code}/play`);
      return;
    }

    if (room?.status !== "waiting") return;

    const interval = setInterval(async () => {
      try {
        const response = await apiFetch(`/api/rooms/${code}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [room?.status, code, router, isCountingDown]);

  const handleNameSubmit = async (name: string) => {
    try {
      const data = await requestGuestSession(name);
      setGuestName(data.name, data.visitorId, data.token);
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
      const response = await apiFetch(`/api/rooms/${code}/start`, {
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

  const isHost = room?.hostId === player?.visitorId;
  const canStart = room?.players && room.players.length >= 2 &&
    room.players.filter(p => !p.isHost).some(p => p.isReady);

  if (loading) {
    return <CandyLoader label="Đang mở phòng…" />;
  }

  if (error && !room) {
    return (
      <CenterScreen mood="sad" title="Không tìm thấy phòng">
        <p className="mb-4 text-lg font-semibold">{error}</p>
        <Button onClick={() => router.push("/")}>Về trang chủ</Button>
      </CenterScreen>
    );
  }

  if (showNameInput) {
    return (
      <CenterScreen title="Bạn tên gì nhỉ?">
        <NameInput onSubmit={handleNameSubmit} buttonText="Vào phòng" />
      </CenterScreen>
    );
  }

  const players = room?.players ?? [];
  const emptySlots = Math.max(0, 4 - players.length);
  const say = isHost
    ? canStart
      ? "Mọi người sẵn sàng rồi, bắt đầu thôi!"
      : players.length < 2
        ? "Gửi mã này cho bạn đi!"
        : "Chờ bạn bấm Sẵn sàng nhé."
    : isReady
      ? "Chờ chủ phòng bắt đầu nhé."
      : "Bấm Sẵn sàng đi nào!";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 pb-6">
      {countdown !== null && <CountdownOverlay value={countdown} />}

      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl">Phòng Sudoku</h1>
        <span className="rounded-full border-[3px] border-ink bg-milk px-3 py-0.5 font-bold">
          {difficultyLabels[room?.difficulty || "medium"]}
        </span>
      </div>

      <MascotSay mascotClassName="w-20" mood={canStart || isReady ? "cheer" : "happy"}>{say}</MascotSay>

      <div className="tray flex flex-col gap-4 p-4">
        <RoomCode code={code} />

        {error && <p role="alert" className="rounded-2xl border-[3px] border-cherry bg-cherry-pale px-3 py-2 font-semibold">{error}</p>}

        <ul className="flex flex-col gap-2" aria-label={`Người chơi ${players.length} trên 4`}>
          {players.map((p) => (
            <PlayerSlot
              key={p.visitorId}
              name={p.name}
              isMe={p.visitorId === player?.visitorId}
              badge={p.isHost ? "host" : undefined}
              status={p.isHost ? undefined : p.isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
              statusActive={p.isReady}
              offline={!p.isConnected}
            />
          ))}
          {emptySlots > 0 && <EmptySlot count={emptySlots} />}
        </ul>

        {!isConnected && <p role="status" className="text-center font-semibold">Đang kết nối lại…</p>}
      </div>

      <div className="mt-auto flex items-center gap-2">
        <Button variant="outline" size="lg" className="!px-4" aria-label="Rời phòng" onClick={() => setShowLeaveConfirm(true)}>
          <DoorIcon />
        </Button>
        <div className="flex-1">
          {isHost ? (
            <Button wrapped fullWidth size="lg" onClick={handleStartGame} disabled={!canStart}>
              {canStart ? "Bắt đầu" : "Đang chờ bạn"}
            </Button>
          ) : (
            <Button wrapped fullWidth size="lg" variant={isReady ? "secondary" : "primary"} onClick={handleReadyToggle}>
              {isReady ? "Đã sẵn sàng" : "Sẵn sàng"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Rời phòng thật à?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-lg font-semibold">Bạn sẽ cần nhập lại mã để quay vào.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleLeaveRoom}>Rời phòng</Button>
          <Button onClick={() => setShowLeaveConfirm(false)}>Ở lại</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
