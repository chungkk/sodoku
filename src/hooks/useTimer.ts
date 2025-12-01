"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerOptions {
  startTime: number | null;
  isRunning: boolean;
}

interface UseTimerReturn {
  elapsedMs: number;
  syncTime: (serverTime: number, gameElapsed: number) => void;
}

export function useTimer({ startTime, isRunning }: UseTimerOptions): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState(0);
  const offsetRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncTime = useCallback((serverTime: number, gameElapsed: number) => {
    const localTime = Date.now();
    const drift = localTime - serverTime;
    offsetRef.current = drift;
    setElapsedMs(gameElapsed);
  }, []);

  useEffect(() => {
    if (!isRunning || !startTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime - offsetRef.current;
      setElapsedMs(Math.max(0, elapsed));
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime, isRunning]);

  return { elapsedMs, syncTime };
}
