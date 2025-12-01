"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface PlayerData {
  sessionId: string;
  playerId: string;
  displayName: string;
  isGuest: boolean;
}

interface PlayerContextType {
  player: PlayerData | null;
  isLoading: boolean;
  error: string | null;
  updateDisplayName: (name: string) => Promise<void>;
  initSession: (displayName: string) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const SESSION_KEY = "sudoku_session";
const DISPLAY_NAME_KEY = "sudoku_display_name";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(async (displayName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem(SESSION_KEY, sessionId);
      }

      localStorage.setItem(DISPLAY_NAME_KEY, displayName);

      const response = await fetch("/api/player/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, displayName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      setPlayer({
        sessionId: data.sessionId,
        playerId: data.playerId,
        displayName: data.displayName,
        isGuest: data.isGuest,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!player) return;

    try {
      const response = await fetch("/api/player/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": player.sessionId,
        },
        body: JSON.stringify({ displayName: name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update name");
      }

      localStorage.setItem(DISPLAY_NAME_KEY, name);
      setPlayer((prev) => (prev ? { ...prev, displayName: name } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [player]);

  useEffect(() => {
    const sessionId = localStorage.getItem(SESSION_KEY);
    const displayName = localStorage.getItem(DISPLAY_NAME_KEY);

    if (sessionId && displayName) {
      initSession(displayName);
    } else {
      setIsLoading(false);
    }
  }, [initSession]);

  return (
    <PlayerContext.Provider
      value={{ player, isLoading, error, updateDisplayName, initSession }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
