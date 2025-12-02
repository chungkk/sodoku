"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  seconds: number;
  isPaused: boolean;
  onPauseToggle: () => void;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const Timer = memo(function Timer({ seconds, isPaused, onPauseToggle }: TimerProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm"
        animate={isPaused ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <span className="text-xl">⏱️</span>
        <span className="font-mono text-xl font-semibold text-gray-800 min-w-[80px] text-center">
          {formatTime(seconds)}
        </span>
      </motion.div>

      <motion.button
        onClick={onPauseToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-xl
          transition-colors
          ${
            isPaused
              ? "bg-success-500 text-white hover:bg-success-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
        aria-label={isPaused ? "Resume game" : "Pause game"}
      >
        <span className="text-lg">{isPaused ? "▶️" : "⏸️"}</span>
      </motion.button>
    </div>
  );
});

export { Timer, formatTime };
export type { TimerProps };
