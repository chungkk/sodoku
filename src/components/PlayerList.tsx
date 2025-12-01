"use client";

import { cn } from "@/lib/utils";
import { Check, Wifi, WifiOff } from "lucide-react";

interface Player {
  id: string;
  displayName: string;
  isReady: boolean;
  isConnected: boolean;
}

interface PlayerListProps {
  players: Player[];
  hostId: string;
  currentPlayerId?: string;
  className?: string;
}

export function PlayerList({
  players,
  hostId,
  currentPlayerId,
  className,
}: PlayerListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Players ({players.length}/4)
      </h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              player.id === currentPlayerId
                ? "bg-primary/5 border-primary/20"
                : "bg-card"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  player.isConnected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {player.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.displayName}</span>
                  {player.id === hostId && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Host
                    </span>
                  )}
                  {player.id === currentPlayerId && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {player.isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              )}
              {player.isReady && (
                <div className="flex items-center gap-1 text-green-500">
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Ready</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {players.length < 4 && (
          <div className="flex items-center justify-center p-3 rounded-lg border border-dashed text-muted-foreground">
            <span className="text-sm">Waiting for players...</span>
          </div>
        )}
      </div>
    </div>
  );
}
