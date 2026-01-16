"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions = [
  { value: "easy", label: "🟢 DỄ", color: "text-green-400" },
  { value: "medium", label: "🟡 TRUNG BÌNH", color: "text-yellow-400" },
  { value: "hard", label: "🔴 KHÓ", color: "text-red-400" },
];

interface CreateRoomFormProps {
  onCancel?: () => void;
  gameType?: "sudoku" | "caro";
}

export function CreateRoomForm({ onCancel, gameType = "sudoku" }: CreateRoomFormProps) {
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"name" | "create">(player ? "create" : "name");

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
        setStep("create");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setIsLoading(false);
      }
    },
    [setGuestName]
  );

  const handleCreateRoom = useCallback(async () => {
    if (!player) {
      setStep("name");
      return;
    }

    if (!player.visitorId || !player.name) {
      setError("Thông tin người chơi không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (gameType === "caro") {
        const response = await fetch("/api/caro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: player.visitorId,
            name: player.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Không thể tạo phòng Caro");
        }

        router.push(`/caro/${data.room.code}`);
      } else {
        const response = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: player.visitorId,
            hostName: player.name,
            difficulty,
            userId: player.oderId || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || "Không thể tạo phòng");
        }

        router.push(`/room/${data.code}`);
      }
    } catch (err) {
      console.error("Create room error:", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo phòng");
      setIsLoading(false);
    }
  }, [player, difficulty, gameType, router]);

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <p className="text-gray-400 font-mono text-sm">
          PLAYER: <span className={`text-${accentColor}-400 font-bold`}>{player?.name}</span>
        </p>
      </div>

      {gameType === "sudoku" && (
        <div className="space-y-2">
          <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
            ► Độ khó
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value as Difficulty)}
                className={`
                  py-2 px-3 border-2 font-mono text-xs uppercase tracking-wider transition-all
                  ${difficulty === opt.value
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                    : 'border-gray-600 text-gray-400 hover:border-cyan-400/50'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameType === "caro" && (
        <div className="border border-pink-500/30 bg-pink-500/10 p-4 text-center">
          <p className="text-pink-300 font-mono text-sm">
            ► BÀN CỜ 15×15 • 2 PLAYERS • 5 Ô LIÊN TIẾP
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 text-center font-mono">{error}</p>
      )}

      <button
        onClick={handleCreateRoom}
        disabled={isLoading}
        className={`
          w-full py-3 px-4 font-bold uppercase tracking-wider transition-all duration-200
          ${isCaro
            ? 'bg-pink-500 hover:bg-pink-400 hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]'
            : 'bg-cyan-500 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]'
          }
          text-black disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? "ĐANG TẠO..." : `▸ TẠO PHÒNG ${isCaro ? 'CARO' : 'SUDOKU'}`}
      </button>

      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 text-gray-500 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors"
        >
          [ HỦY ]
        </button>
      )}
    </motion.div>
  );
}
