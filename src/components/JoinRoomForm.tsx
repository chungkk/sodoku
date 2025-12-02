"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";

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

      <Input
        label="Mã phòng"
        placeholder="Nhập mã phòng 6 ký tự"
        value={roomCode}
        onChange={(e) => {
          setRoomCode(e.target.value.toUpperCase());
          setError(null);
        }}
        error={error || undefined}
        maxLength={6}
        autoFocus
        className="text-center font-mono text-xl tracking-widest uppercase"
      />

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
