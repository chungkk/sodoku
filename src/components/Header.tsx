"use client";

import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";

export function Header() {
  const { player, isGuest } = usePlayer();

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a1a]/95 backdrop-blur-md border-b-2 border-cyan-400/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">🎮</span>
          <span
            className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(180deg, #fff 0%, #00ffff 100%)',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
            }}
          >
            Solo Games
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/practice"
            className="text-gray-400 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors hidden sm:block"
          >
            [ Tập luyện ]
          </Link>

          {player && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-cyan-300 font-mono hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]"></span>
                {isGuest ? "GUEST:" : "PLAYER:"} {player.name}
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
