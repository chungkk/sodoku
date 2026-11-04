"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NameInput } from "@/components/NameInput";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { apiFetch, requestGuestSession } from "@/lib/api-client";

type GameType = "sudoku" | "caro";

interface JoinRoomFormProps {
  onCancel?: () => void;
  initialCode?: string;
  /** "any": tự tìm mã phòng trong cả hai trò */
  gameType?: GameType | "any";
}

const GAMES: Record<GameType, { path: string; maxPlayers: number }> = {
  sudoku: { path: "/api/rooms", maxPlayers: 4 },
  caro: { path: "/api/caro", maxPlayers: 2 },
};

export function JoinRoomForm({ onCancel, initialCode = "", gameType = "sudoku" }: JoinRoomFormProps) {
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  const [roomCode, setRoomCode] = useState(initialCode);
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

  const handleJoinRoom = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = roomCode.trim().toUpperCase();

      if (code.length !== 6) {
        setError("Mã phòng có đúng 6 ký tự");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const candidates: GameType[] = gameType === "any" ? ["sudoku", "caro"] : [gameType];

        for (const game of candidates) {
          const response = await apiFetch(`${GAMES[game].path}/${code}`);
          if (response.status === 404) continue;

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Không thể vào phòng");
          if (data.status !== "waiting") throw new Error("Ván này đã bắt đầu, không vào được nữa");
          if (data.players.length >= GAMES[game].maxPlayers) {
            throw new Error(`Phòng đã đủ ${GAMES[game].maxPlayers} người`);
          }

          router.push(`/${game}/${code}`);
          return;
        }

        throw new Error("Không tìm thấy phòng có mã này, bạn kiểm tra lại nhé");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        setIsLoading(false);
      }
    },
    [roomCode, gameType, router]
  );

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
    <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-lg font-bold">Mã phòng</span>
        <input
          type="text"
          placeholder="ABC123"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value.toUpperCase());
            setError(null);
          }}
          maxLength={6}
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={!!error}
          className={`w-full rounded-2xl border-4 bg-white px-2 py-3 text-center font-display text-3xl tracking-[0.2em] text-ink placeholder:text-ink/65 focus:ring-4 focus:ring-lemon ${
            error ? "border-cherry focus:border-cherry" : "border-ink focus:border-ink"
          }`}
        />
      </label>

      {error && <p role="alert" className="text-center font-semibold text-cherry">{error}</p>}

      <Button type="submit" wrapped fullWidth size="lg" disabled={roomCode.length !== 6} isLoading={isLoading}>
        Vào phòng
      </Button>

      <p className="text-center font-semibold text-ink-soft">Bạn chơi với tên {player.name}</p>
      {onCancel && <Button variant="ghost" fullWidth onClick={onCancel}>Hủy</Button>}
    </form>
  );
}
