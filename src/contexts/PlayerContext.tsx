"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GUEST_SESSION_KEY } from "@/lib/api-client";

export interface PlayerSession {
  visitorId: string;
  token: string;
  name: string;
}

interface PlayerContextType {
  player: PlayerSession | null;
  isLoading: boolean;
  setGuestName: (name: string, visitorId: string, token: string) => void;
  clearSession: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PlayerSession;
        // Phiên cũ chưa có token thì không dùng được nữa: để người chơi nhập tên lại
        if (parsed.token) {
          setPlayer(parsed);
        } else {
          localStorage.removeItem(GUEST_SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(GUEST_SESSION_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const setGuestName = useCallback((name: string, visitorId: string, token: string) => {
    const newSession: PlayerSession = { visitorId, token, name };
    setPlayer(newSession);
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
  }, []);

  const clearSession = useCallback(() => {
    setPlayer(null);
    localStorage.removeItem(GUEST_SESSION_KEY);
  }, []);

  const value: PlayerContextType = {
    player,
    isLoading,
    setGuestName,
    clearSession,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
