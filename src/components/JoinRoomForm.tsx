"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";

interface RoomSuggestion {
  code: string;
  status: string;
  difficulty: string;
  playerCount: number;
  createdAt: string;
}

interface JoinRoomFormProps {
  onCancel?: () => void;
  initialCode?: string;
}

export function JoinRoomForm({ onCancel, initialCode = "" }: JoinRoomFormProps) {
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  const [roomCode, setRoomCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"code" | "name">(player ? "code" : "name");
  
  const [rooms, setRooms] = useState<RoomSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.code.toLowerCase().includes(roomCode.toLowerCase())
  );

  const difficultyLabel = (d: string) => {
    switch (d) {
      case "easy": return "Dễ";
      case "medium": return "TB";
      case "hard": return "Khó";
      default: return d;
    }
  };

  const handleNameSubmit = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/player/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create session");
        }

        const data = await response.json();
        setGuestName(data.name, data.visitorId);
        setStep("code");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setIsLoading(false);
      }
    },
    [setGuestName]
  );

  const handleJoinRoom = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = roomCode.trim().toUpperCase();

      if (code.length !== 6) {
        setError("Mã phòng phải có 6 ký tự");
        return;
      }

      if (!player) {
        setStep("name");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/rooms/${code}`);

        if (!response.ok) {
          const data = await response.json();
          if (data.code === "ROOM_NOT_FOUND") {
            throw new Error("Không tìm thấy phòng với mã này");
          }
          throw new Error(data.error || "Không thể tham gia phòng");
        }

        const roomData = await response.json();

        if (roomData.status !== "waiting") {
          throw new Error("Trò chơi đã bắt đầu, không thể tham gia");
        }

        if (roomData.players.length >= 4) {
          throw new Error("Phòng đã đầy (tối đa 4 người chơi)");
        }

        router.push(`/room/${code}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        setIsLoading(false);
      }
    },
    [roomCode, player, router]
  );

  if (step === "name") {
    return (
      <div className="space-y-4">
        <NameInput
          onSubmit={handleNameSubmit}
          buttonText="Tiếp tục"
          isLoading={isLoading}
        />
        {error && (
          <p className="text-sm text-error-500 text-center">{error}</p>
        )}
        {onCancel && (
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Hủy
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleJoinRoom}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {player && (
        <div className="text-center mb-4">
          <p className="text-gray-600">
            Xin chào, <span className="font-semibold">{player.name}</span>!
          </p>
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          label="Mã phòng"
          placeholder="Nhập mã phòng 6 ký tự"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value.toUpperCase());
            setError(null);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            fetchRooms();
            setShowSuggestions(true);
          }}
          error={error || undefined}
          maxLength={6}
          autoFocus
          autoComplete="off"
          className="text-center font-mono text-xl tracking-widest uppercase"
        />
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
          >
            {loadingRooms ? (
              <div className="p-3 text-gray-500 text-sm text-center">
                Đang tải...
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <button
                  key={room.code}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => {
                    setRoomCode(room.code);
                    setShowSuggestions(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-gray-900">
                      {room.code}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {difficultyLabel(room.difficulty)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          room.status === "waiting"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {room.status === "waiting"
                          ? `${room.playerCount}/4`
                          : "Đang chơi"}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-sm text-center">
                {roomCode ? "Không tìm thấy phòng" : "Chưa có phòng nào"}
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={roomCode.length !== 6 || isLoading}
        isLoading={isLoading}
      >
        🔗 Tham gia phòng
      </Button>

      {onCancel && (
        <Button variant="ghost" fullWidth onClick={onCancel}>
          Hủy
        </Button>
      )}
    </motion.form>
  );
}
