"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { Awning } from "@/components/candy";
import { Mascot } from "@/components/Mascot";

export function Header() {
  const { player } = usePlayer();
  const pathname = usePathname();
  // Trên điện thoại, màn chơi dành toàn bộ chiều cao cho bàn cờ
  const isStage = pathname.endsWith("/play") || pathname === "/practice";

  return (
    <header className={`relative z-30 ${isStage ? "hidden lg:block" : ""}`}>
      <Awning />
      <div className={`mx-auto h-14 items-center justify-between gap-3 px-4 ${pathname === "/" ? "hidden max-w-6xl lg:flex" : "flex max-w-5xl"}`}>
        {pathname === "/" ? (
          <span />
        ) : (
          <Link href="/" className="flex min-w-0 items-center gap-1.5 rounded-full">
            <Mascot animated={false} className="w-9" />
            <span className="whitespace-nowrap font-display text-xl text-ink">Solo Games</span>
          </Link>
        )}

        <nav className="flex min-w-0 items-center gap-3">
          <Link href="/practice" className="whitespace-nowrap font-semibold underline decoration-[3px] underline-offset-4 hover:decoration-cherry">
            Luyện tập
          </Link>
          {player && (
            <span className="hidden max-w-40 truncate rounded-full border-[3px] border-ink bg-milk px-3 py-0.5 font-semibold sm:block">
              {player.name}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
