"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const PlayerRow = memo(function PlayerRow({
  player,
  rank,
  isCurrentPlayer,
  gameStatus,
}: {
  player: PlayerProgress;
  rank: number;
  isCurrentPlayer: boolean;
  gameStatus: string;
}) {
  const getRankEmoji = (rank: number, finished: boolean): string => {
    if (!finished) return "";
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getStatusColor = (): string => {
    if (player.gaveUp) return "bg-gray-200";
    if (player.finished) return "bg-success-100";
    if (!player.isConnected) return "bg-orange-100";
    return "bg-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
      className={`
        flex items-center gap-3 p-3 rounded-xl border
        ${isCurrentPlayer ? "border-primary-300 bg-primary-50" : "border-gray-200"}
        ${getStatusColor()}
        ${!player.isConnected ? "opacity-60" : ""}
      `}
    >
      <div className="w-8 text-center font-bold text-gray-500">
        {player.finished && gameStatus === "finished" ? (
          <span className="text-lg">{getRankEmoji(rank, true)}</span>
        ) : (
          <span>#{rank}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{player.name}</span>
          {isCurrentPlayer && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              Bạn
            </span>
          )}
          {!player.isConnected && (
            <span className="text-xs text-orange-500">Mất kết nối</span>
          )}
          {player.gaveUp && (
            <span className="text-xs text-gray-500">Đã bỏ cuộc</span>
          )}
        </div>

        {gameStatus === "playing" && !player.gaveUp && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{player.progress}%</span>
              <span>{player.errors} lỗi</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  player.finished ? "bg-success-500" : "bg-primary-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(player.progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {gameStatus === "finished" && player.finished && player.time !== null && (
          <div className="text-sm text-gray-600 mt-1">
            ⏱️ {formatTime(player.time!)} • {player.errors} lỗi
          </div>
        )}
      </div>
    </motion.div>
  );
});

export const Leaderboard = memo(function Leaderboard({
  players,
  currentPlayerId,
  gameStatus,
}: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.gaveUp && !b.gaveUp) return 1;
    if (!a.gaveUp && b.gaveUp) return -1;
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    if (a.finished && b.finished && a.time != null && b.time != null) {
      if (a.time !== b.time) return a.time - b.time;
    }
    if (b.progress !== a.progress) return b.progress - a.progress;
    return a.errors - b.errors;
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span>🏆</span>
        Bảng xếp hạng
      </h3>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedPlayers.map((player, index) => (
            <PlayerRow
              key={player.visitorId}
              player={player}
              rank={index + 1}
              isCurrentPlayer={player.visitorId === currentPlayerId}
              gameStatus={gameStatus}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});
