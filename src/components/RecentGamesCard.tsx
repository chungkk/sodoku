"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface GameRecord {
  date: string;
  mode: "practice" | "solo";
  difficulty: string;
  time: number;
  errors: number;
  won: boolean;
}

interface RecentGamesCardProps {
  games: GameRecord[];
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
};

const difficultyLabels: Record<string, string> = {
  easy: "Dễ",
  medium: "TB",
  hard: "Khó",
};

export const RecentGamesCard = memo(function RecentGamesCard({
  games,
}: RecentGamesCardProps) {
  if (games.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🕹️</span>
            Lịch sử chơi
          </h3>
          <p className="text-gray-500 text-center py-8">
            Chưa có ván đấu nào được ghi lại
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🕹️</span>
          Lịch sử chơi gần đây
        </h3>

        <div className="space-y-2">
          {games.slice(0, 10).map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-3 rounded-xl
                ${game.won ? "bg-success-50" : "bg-gray-50"}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {game.mode === "practice" ? "🎯" : "🏆"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {game.mode === "practice" ? "Tập luyện" : "Thi đấu"}
                    </span>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {difficultyLabels[game.difficulty] || game.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(game.date)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-900">{formatTime(game.time)}</p>
                <p className="text-xs text-gray-500">{game.errors} lỗi</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
});
