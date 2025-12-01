"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b-4 border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary flex items-center justify-center retro-border-sm">
              <span className="font-retro text-lg text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-retro text-xl text-foreground tracking-wider hidden sm:block">
              SUDOKU
            </span>
          </Link>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/practice" 
              className="font-retro text-base px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              [ LUYỆN TẬP ]
            </Link>
            <Link 
              href="/" 
              className="font-retro text-base px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              [ ĐẤU TRƯỜNG ]
            </Link>
          </nav>

          {/* Nav - Mobile */}
          <nav className="flex md:hidden items-center gap-2">
            <Link 
              href="/practice" 
              className="font-retro text-sm px-2 py-1 text-muted-foreground hover:text-primary"
            >
              PLAY
            </Link>
            <span className="text-border">|</span>
            <Link 
              href="/" 
              className="font-retro text-sm px-2 py-1 text-muted-foreground hover:text-primary"
            >
              PVP
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
