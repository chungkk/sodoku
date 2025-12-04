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
    <div className="px-4 py-1">
      <div className="flex items-center gap-2">
        {/* My side */}
        <span className="text-xs font-bold text-blue-600 w-8">{myProgress}%</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${myProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* VS Badge */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">VS</span>
        </div>

        {/* Opponent side */}
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-l from-red-400 to-red-600 rounded-full ml-auto"
            initial={{ width: 0 }}
            animate={{ width: `${opponentProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ marginLeft: "auto" }}
          />
        </div>
        <span className="text-xs font-bold text-red-500 w-8 text-right">{opponentProgress}%</span>
      </div>
    </div>
  );
}
