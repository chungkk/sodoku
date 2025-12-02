"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Stats {
  totalGames: number;
  wins: number;
  bestTime: number | null;
}

interface StatsCardProps {
  stats: Stats;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const StatsCard = memo(function StatsCard({ stats }: StatsCardProps) {
  const winRate = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          Thống kê
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-gray-900">{stats.totalGames}</p>
            <p className="text-sm text-gray-500">Tổng số ván</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-primary-500">{stats.wins}</p>
            <p className="text-sm text-gray-500">Chiến thắng</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-success-500">{winRate}%</p>
            <p className="text-sm text-gray-500">Tỷ lệ thắng</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-gray-900">
              {stats.bestTime ? formatTime(stats.bestTime) : "--:--"}
            </p>
            <p className="text-sm text-gray-500">Thời gian tốt nhất</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
