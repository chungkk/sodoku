"use client";

import { memo } from "react";

interface PlayerProgress {
  visitorId: string;
  name: string;
  progress: number;
  errors: number;
  isConnected: boolean;
  finished: boolean;
  gaveUp: boolean;
  time?: number | null;
}

interface LeaderboardProps {
  players: PlayerProgress[];
  currentPlayerId: string;
  gameStatus: "waiting" | "playing" | "finished";
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RANK_COLORS = ["bg-lemon", "bg-milk", "bg-gum"];

export const Leaderboard = memo(function Leaderboard({ players, currentPlayerId }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.gaveUp && !b.gaveUp) return 1;
    if (!a.gaveUp && b.gaveUp) return -1;
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    if (a.finished && b.finished && a.time != null && b.time != null && a.time !== b.time) {
      return a.time - b.time;
    }
    if (b.progress !== a.progress) return b.progress - a.progress;
    return a.errors - b.errors;
  });

  return (
    <ol className="flex flex-col gap-1.5 text-left">
      {sortedPlayers.map((player, index) => {
        const isMe = player.visitorId === currentPlayerId;
        const detail = player.gaveUp
          ? "Đã bỏ cuộc"
          : player.finished && player.time != null
            ? `${formatTime(player.time)} · ${player.errors} lỗi`
            : `${Math.max(0, player.progress)}% · ${player.errors} lỗi`;
        return (
          <li key={player.visitorId} className={`flex items-center gap-2.5 rounded-2xl border-[3px] border-ink p-1.5 ${isMe ? "bg-lemon-pale" : "bg-white"}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-display text-lg ${player.gaveUp ? "bg-mint-pale" : RANK_COLORS[index] ?? "bg-milk"}`}>
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold leading-tight">{player.name}{isMe ? " (bạn)" : ""}</span>
              <span className="block font-semibold leading-tight text-ink-soft tabular-nums">{detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
});
