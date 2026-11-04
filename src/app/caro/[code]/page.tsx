"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CandyLoader, CandyO, CandyX, MascotSay } from "@/components/candy";
import { DoorIcon } from "@/components/icons";
import { NameInput } from "@/components/NameInput";
import { CenterScreen, CountdownOverlay, EmptySlot, PlayerSlot, RoomCode } from "@/components/room";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import { apiFetch, requestGuestSession } from "@/lib/api-client";

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
    token: player?.token,
    autoConnect: !!player,
  });

  const fetchRoom = useCallback(async () => {
    try {
      const response = await apiFetch(`/api/caro/${code}`);
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
        const response = await apiFetch(`/api/caro/${code}/join`, {
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
      const response = await apiFetch(`/api/caro/${code}/start`, {
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

  const handleGuestSubmit = async (name: string) => {
    try {
      const data = await requestGuestSession(name);
      setGuestName(data.name, data.visitorId, data.token);
      setShowNameInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  if (loading) {
    return <CandyLoader label="Đang mở phòng…" />;
  }

  if (error || !room) {
    return (
      <CenterScreen mood="sad" title="Không vào được phòng">
        <p className="mb-4 text-lg font-semibold">{error || "Không tìm thấy phòng"}</p>
        <Button onClick={() => router.push("/caro")}>Về sảnh Caro</Button>
      </CenterScreen>
    );
  }

  const me = room.players.find(p => p.visitorId === player?.visitorId);
  const isHost = room.players[0]?.visitorId === player?.visitorId;
  const allReady = room.players.length === 2 && room.players.every(p => p.isReady);
  const canStart = isHost && allReady;
  const say = room.players.length < 2
    ? "Gửi mã này cho bạn đi!"
    : canStart
      ? "Mọi người sẵn sàng rồi, bắt đầu thôi!"
      : allReady
        ? "Chờ chủ phòng bắt đầu nhé."
        : me?.isReady
          ? "Chờ bạn bấm Sẵn sàng nhé."
          : "Bấm Sẵn sàng đi nào!";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 pb-6">
      {countdown !== null && <CountdownOverlay value={countdown} />}

      <h1 className="font-display text-3xl">Phòng Caro</h1>

      <MascotSay mascotClassName="w-20" mood={allReady ? "cheer" : "happy"}>{say}</MascotSay>

      <div className="tray flex flex-col gap-4 p-4">
        <RoomCode code={code} />

        <ul className="flex flex-col gap-2" aria-label={`Người chơi ${room.players.length} trên 2`}>
          {room.players.map((p, index) => (
            <PlayerSlot
              key={p.visitorId}
              name={p.name}
              isMe={p.visitorId === player?.visitorId}
              badge={index === 0 ? "host" : undefined}
              status={p.isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
              statusActive={p.isReady}
              piece={p.symbol === "O" ? <CandyO className="h-11 w-11" /> : <CandyX className="h-11 w-11" />}
            />
          ))}
          {room.players.length < 2 && <EmptySlot />}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {isHost && (
          <Button wrapped fullWidth size="lg" onClick={handleStartGame} disabled={!canStart}>
            {canStart ? "Bắt đầu" : "Chưa đủ người sẵn sàng"}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" className="!px-4" aria-label="Rời phòng" onClick={() => setShowLeaveConfirm(true)}>
            <DoorIcon />
          </Button>
          {me && (
            <div className="flex-1">
              <Button
                fullWidth
                variant={me.isReady ? "outline" : isHost ? "secondary" : "primary"}
                onClick={handleToggleReady}
                disabled={room.players.length < 2}
              >
                {me.isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showNameInput} onClose={() => router.push("/caro")}>
        <DialogHeader>
          <DialogTitle>Bạn tên gì nhỉ?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <NameInput onSubmit={handleGuestSubmit} buttonText="Vào phòng" />
        </DialogContent>
      </Dialog>

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
