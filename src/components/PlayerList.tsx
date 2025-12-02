"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  visitorId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  progress?: number;
  errors?: number;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  showReadyStatus?: boolean;
  showProgress?: boolean;
  onReadyToggle?: () => void;
  isReady?: boolean;
}

const PlayerItem = memo(function PlayerItem({
  player,
  isCurrentPlayer,
  showReadyStatus,
  showProgress,
}: {
  player: Player;
  isCurrentPlayer: boolean;
  showReadyStatus?: boolean;
  showProgress?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        flex items-center justify-between p-3 rounded-xl
        ${isCurrentPlayer ? "bg-primary-50 border border-primary-200" : "bg-gray-50"}
        ${!player.isConnected ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
            ${player.isHost ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-600"}
          `}
        >
          {player.isHost ? "👑" : player.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{player.name}</span>
            {isCurrentPlayer && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                Bạn
              </span>
            )}
          </div>
          {player.isHost && (
            <span className="text-xs text-gray-500">Chủ phòng</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showProgress && typeof player.progress === "number" && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {player.progress}%
            </div>
            <div className="text-xs text-gray-500">
              {player.errors || 0} lỗi
            </div>
          </div>
        )}

        {showReadyStatus && !player.isHost && (
          <span
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${
                player.isReady
                  ? "bg-success-100 text-success-700"
                  : "bg-gray-200 text-gray-600"
              }
            `}
          >
            {player.isReady ? "✓ Sẵn sàng" : "Chờ..."}
          </span>
        )}

        {!player.isConnected && (
          <span className="text-xs text-orange-500">Đang kết nối lại...</span>
        )}
      </div>
    </motion.div>
  );
});

export const PlayerList = memo(function PlayerList({
  players,
  currentPlayerId,
  showReadyStatus = true,
  showProgress = false,
  onReadyToggle,
  isReady = false,
}: PlayerListProps) {
  const currentPlayer = players.find((p) => p.visitorId === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Người chơi ({players.length}/4)
        </h3>
        {showReadyStatus && !isHost && onReadyToggle && (
          <motion.button
            onClick={onReadyToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-4 py-2 rounded-xl font-medium transition-colors
              ${
                isReady
                  ? "bg-success-500 text-white hover:bg-success-600"
                  : "bg-primary-500 text-white hover:bg-primary-600"
              }
            `}
          >
            {isReady ? "✓ Đã sẵn sàng" : "Sẵn sàng"}
          </motion.button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <PlayerItem
              key={player.visitorId}
              player={player}
              isCurrentPlayer={player.visitorId === currentPlayerId}
              showReadyStatus={showReadyStatus}
              showProgress={showProgress}
            />
          ))}
        </AnimatePresence>

        {players.length < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400"
          >
            <span>Đang chờ người chơi...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
});
