"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerOptions {
  initialSeconds?: number;
  autoStart?: boolean;
}

interface UseTimerReturn {
  seconds: number;
  isPaused: boolean;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newSeconds?: number) => void;
  toggle: () => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { initialSeconds = 0, autoStart = false } = options;

  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(
    (newSeconds?: number) => {
      clearTimerInterval();
      setSeconds(newSeconds ?? initialSeconds);
      setIsRunning(false);
      setIsPaused(true);
    },
    [clearTimerInterval, initialSeconds]
  );

  const toggle = useCallback(() => {
    if (!isRunning) {
      start();
    } else {
      setIsPaused((prev) => !prev);
    }
  }, [isRunning, start]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearTimerInterval();
    }

    return clearTimerInterval;
  }, [isRunning, isPaused, clearTimerInterval]);

  return {
    seconds,
    isPaused,
    isRunning,
    start,
    pause,
    resume,
    reset,
    toggle,
  };
}
