"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";

interface JoinRoomFormProps {
  onCancel?: () => void;
  initialCode?: string;
  gameType?: "sudoku" | "caro";
}

export function JoinRoomForm({ onCancel, initialCode = "", gameType = "sudoku" }: JoinRoomFormProps) {
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
        if (gameType === "caro") {
          const response = await fetch(`/api/caro/${code}`);

          if (!response.ok) {
            const data = await response.json();
            if (data.code === "ROOM_NOT_FOUND") {
              throw new Error("Không tìm thấy phòng Caro với mã này");
            }
            throw new Error(data.error || "Không thể tham gia phòng");
          }

          const roomData = await response.json();

          if (roomData.status !== "waiting") {
            throw new Error("Trò chơi đã bắt đầu, không thể tham gia");
          }

          if (roomData.players.length >= 2) {
            throw new Error("Phòng đã đầy (tối đa 2 người chơi)");
          }

          router.push(`/caro/${code}`);
        } else {
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

          router.push(`/sudoku/${code}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        setIsLoading(false);
      }
    },
    [roomCode, player, gameType, router]
  );

  const isCaro = gameType === "caro";
  const accentColor = isCaro ? "pink" : "cyan";

  if (step === "name") {
    return (
      <div className="space-y-4">
        <NameInput
          onSubmit={handleNameSubmit}
          buttonText="▸ TIẾP TỤC"
          isLoading={isLoading}
        />
        {error && (
          <p className="text-sm text-red-400 text-center font-mono">{error}</p>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-2 text-gray-500 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors"
          >
            [ HỦY ]
          </button>
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
          <p className="text-gray-400 font-mono text-sm">
            PLAYER: <span className={`text-${accentColor}-400 font-bold`}>{player.name}</span>
          </p>
        </div>
      )}

      {gameType === "caro" && (
        <div className="border border-pink-500/30 bg-pink-500/10 p-3 text-center mb-2">
          <p className="text-pink-300 font-mono text-xs">
            ► PHÒNG CARO • 2 PLAYERS
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider">
          ► Mã phòng
        </label>
        <input
          type="text"
          placeholder="NHẬP MÃ 6 KÝ TỰ"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value.toUpperCase());
            setError(null);
          }}
          maxLength={6}
          autoFocus
          className={`
            w-full px-4 py-3 bg-transparent border-2 
            ${error ? 'border-red-500' : `border-${accentColor}-400/50 focus:border-${accentColor}-400`}
            text-white font-mono text-2xl text-center tracking-[0.5em] uppercase
            placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-sm
            focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.3)]
            transition-all
          `}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center font-mono">► {error}</p>
      )}

      <button
        type="submit"
        disabled={roomCode.length !== 6 || isLoading}
        className={`
          w-full py-3 px-4 font-bold uppercase tracking-wider transition-all duration-200
          ${isCaro
            ? 'bg-pink-500 hover:bg-pink-400 hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]'
            : 'bg-cyan-500 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]'
          }
          text-black disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? "ĐANG KẾT NỐI..." : `▸ THAM GIA PHÒNG`}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-gray-500 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors"
        >
          [ HỦY ]
        </button>
      )}
    </motion.form>
  );
}
