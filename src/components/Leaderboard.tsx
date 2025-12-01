"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trophy, Clock, XCircle } from "lucide-react";

interface PlayerResult {
  playerId: string;
  sessionId: string;
  displayName: string;
  status: "completed" | "gave_up" | "in_progress";
  completionTime: number | null;
  mistakesCount: number;
  rank: number | null;
}

interface LeaderboardProps {
  results: PlayerResult[];
  currentSessionId?: string;
  className?: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getRankIcon(rank: number | null) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
  return null;
}

export function Leaderboard({
  results,
  currentSessionId,
  className,
}: LeaderboardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((player, index) => (
            <div
              key={player.playerId}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                player.sessionId === currentSessionId
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50",
                player.rank === 1 && "bg-yellow-500/10 border border-yellow-500/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {player.status === "completed" ? (
                    getRankIcon(player.rank) || (
                      <span className="text-lg font-bold text-muted-foreground">
                        {player.rank}
                      </span>
                    )
                  ) : player.status === "gave_up" ? (
                    <XCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {player.displayName}
                    {player.sessionId === currentSessionId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {player.mistakesCount} mistake{player.mistakesCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {player.status === "completed" && player.completionTime ? (
                  <p className="text-lg font-mono font-bold">
                    {formatTime(player.completionTime)}
                  </p>
                ) : player.status === "gave_up" ? (
                  <p className="text-sm text-destructive font-medium">Gave up</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Playing...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
