"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PlayerSession, createGuestSession } from "@/lib/auth";

interface PlayerContextType {
  player: PlayerSession | null;
  isLoading: boolean;
  isGuest: boolean;
  setGuestName: (name: string, visitorId?: string) => void;
  clearSession: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const GUEST_SESSION_KEY = "sudoku_guest_session";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [guestSession, setGuestSession] = useState<PlayerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      setGuestSession(null);
      localStorage.removeItem(GUEST_SESSION_KEY);
    } else {
      const stored = localStorage.getItem(GUEST_SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as PlayerSession;
          setGuestSession(parsed);
        } catch {
          localStorage.removeItem(GUEST_SESSION_KEY);
        }
      }
    }

    setIsLoading(false);
  }, [session, status]);

  const setGuestName = useCallback((name: string, visitorId?: string) => {
    const newSession: PlayerSession = visitorId 
      ? { visitorId, name, isGuest: true }
      : createGuestSession(name);
    setGuestSession(newSession);
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
  }, []);

  const clearSession = useCallback(() => {
    setGuestSession(null);
    localStorage.removeItem(GUEST_SESSION_KEY);
  }, []);

  const player: PlayerSession | null = session?.user
    ? {
        visitorId: `user_${session.user.id}`,
        oderId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        isGuest: false,
      }
    : guestSession;

  const value: PlayerContextType = {
    player,
    isLoading: status === "loading" || isLoading,
    isGuest: player?.isGuest ?? true,
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
