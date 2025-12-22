"use client";

import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "./ui/button";

export function Header() {
  const { player, isGuest } = usePlayer();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl">🧩</span>
          <span className="text-xl font-bold text-gray-900 group-hover:text-primary-500 transition-colors">
            Solo Online
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/practice"
            className="text-gray-600 hover:text-primary-500 font-medium transition-colors hidden sm:block"
          >
            Tập luyện
          </Link>

          {player ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                {isGuest ? "👤" : "✨"} {player.name}
              </span>
              {!isGuest && (
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    Hồ sơ
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
