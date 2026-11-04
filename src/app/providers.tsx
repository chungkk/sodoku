"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}
