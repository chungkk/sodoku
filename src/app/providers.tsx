"use client";

import { MotionConfig } from "framer-motion";
import { PlayerProvider } from "@/contexts/PlayerContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PlayerProvider>{children}</PlayerProvider>
    </MotionConfig>
  );
}
