"use client";

import { CandyBar } from "@/components/candy";

interface Player {
  visitorId: string;
  name: string;
  progress: number;
  gaveUp?: boolean;
  isConnected?: boolean;
}

interface VersusProgressBarProps {
  players: Player[];
  currentPlayerId: string;
}

/** Tiến độ của mình và của từng đối thủ */
export function VersusProgressBar({ players, currentPlayerId }: VersusProgressBarProps) {
  if (players.length < 2) return null;

  const ordered = [...players].sort((a, b) => Number(b.visitorId === currentPlayerId) - Number(a.visitorId === currentPlayerId));

  return (
    <ul className="flex flex-col gap-0.5">
      {ordered.map((player) => {
        const isMe = player.visitorId === currentPlayerId;
        const name = isMe ? "Bạn" : player.name;
        const note = player.gaveUp ? "bỏ cuộc" : player.isConnected === false ? "mất mạng" : `${Math.max(0, player.progress)}%`;
        return (
          <li key={player.visitorId} className={`flex items-center gap-2 ${player.gaveUp ? "opacity-60" : ""}`}>
            <span className="w-16 truncate font-bold leading-tight">{name}</span>
            <CandyBar value={player.progress} rival={!isMe} label={`Tiến độ của ${name}`} />
            <span className="w-14 text-right font-bold tabular-nums leading-tight">{note}</span>
          </li>
        );
      })}
    </ul>
  );
}
