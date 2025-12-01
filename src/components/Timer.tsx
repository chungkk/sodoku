"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimerProps {
  elapsedMs: number;
  className?: string;
}

export function Timer({ elapsedMs, className }: TimerProps) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatTime = () => {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-2xl font-mono font-bold",
        className
      )}
    >
      <Clock className="w-6 h-6 text-muted-foreground" />
      <span>{formatTime()}</span>
    </div>
  );
}
