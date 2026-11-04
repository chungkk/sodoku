"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NameInput } from "@/components/NameInput";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { Difficulty } from "@/lib/sudoku";
import { apiFetch, requestGuestSession } from "@/lib/api-client";

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
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

  const handleNameSubmit = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await requestGuestSession(name);
        setGuestName(data.name, data.visitorId, data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setIsLoading(false);
      }
    },
    [setGuestName]
  );

  const handleCreateRoom = useCallback(async () => {
    if (!player?.visitorId || !player.name) {
      setError("Thông tin người chơi không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (gameType === "caro") {
        const response = await apiFetch("/api/caro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: player.visitorId, name: player.name }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Không thể tạo phòng Caro");
        router.push(`/caro/${data.room.code}`);
      } else {
        const response = await apiFetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: player.visitorId, hostName: player.name, difficulty }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.error || "Không thể tạo phòng");
        router.push(`/sudoku/${data.code}`);
      }
    } catch (err) {
      console.error("Create room error:", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo phòng");
      setIsLoading(false);
    }
  }, [player, difficulty, gameType, router]);

  if (!player) {
    return (
      <div className="flex flex-col gap-3">
        <NameInput onSubmit={handleNameSubmit} isLoading={isLoading} />
        {error && <p role="alert" className="text-center font-semibold text-cherry">{error}</p>}
        {onCancel && <Button variant="ghost" fullWidth onClick={onCancel}>Hủy</Button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {gameType === "sudoku" && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="pb-1.5 text-lg font-bold">Độ khó</legend>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={difficulty === opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`min-h-12 rounded-full border-4 border-ink px-1 text-[0.95rem] font-bold leading-none transition-colors ${
                  difficulty === opt.value ? "bg-lemon" : "bg-white hover:bg-lemon-pale"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {error && <p role="alert" className="text-center font-semibold text-cherry">{error}</p>}

      <Button wrapped fullWidth size="lg" onClick={handleCreateRoom} isLoading={isLoading}>
        Tạo phòng
      </Button>

      <p className="text-center font-semibold text-ink-soft">Bạn chơi với tên {player.name}</p>
      {onCancel && <Button variant="ghost" fullWidth onClick={onCancel}>Hủy</Button>}
    </div>
  );
}
