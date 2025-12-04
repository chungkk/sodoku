"use client";

import { motion } from "framer-motion";

interface Player {
  visitorId: string;
  name: string;
  progress: number;
  isHost?: boolean;
}

interface VersusProgressBarProps {
  players: Player[];
  currentPlayerId: string;
}

export function VersusProgressBar({ players, currentPlayerId }: VersusProgressBarProps) {
  if (players.length < 2) return null;

  const currentPlayer = players.find(p => p.visitorId === currentPlayerId);
  const opponent = players.find(p => p.visitorId !== currentPlayerId);

  if (!currentPlayer || !opponent) return null;

  const myProgress = Math.max(0, currentPlayer.progress);
  const opponentProgress = Math.max(0, opponent.progress);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2">
        {/* My side */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-600 truncate max-w-[80px]">
              {currentPlayer.name}
            </span>
            <span className="text-sm font-bold text-blue-600">{myProgress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${myProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* VS Badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">VS</span>
        </div>

        {/* Opponent side */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-red-500">{opponentProgress}%</span>
            <span className="text-xs font-medium text-red-500 truncate max-w-[80px]">
              {opponent.name}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-red-400 to-red-600 rounded-full ml-auto"
              initial={{ width: 0 }}
              animate={{ width: `${opponentProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ marginLeft: "auto" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
