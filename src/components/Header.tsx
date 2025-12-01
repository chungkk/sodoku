"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary/20 border border-primary/50 flex items-center justify-center">
              <span className="font-pixel text-sm text-primary">S</span>
            </div>
            <span className="font-pixel text-xs text-foreground hidden sm:block tracking-wide">
              SUDOKU
            </span>
          </Link>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/practice" 
              className="font-retro text-lg px-4 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              PRACTICE
            </Link>
            <span className="text-border">|</span>
            <Link 
              href="/" 
              className="font-retro text-lg px-4 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              ARENA
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <span className="text-muted-foreground font-retro text-sm">...</span>
            ) : isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="font-retro text-sm text-primary hover:underline hidden sm:block"
                >
                  {user.displayName}
                </Link>
                <span className="text-muted-foreground hidden sm:block">|</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="font-retro text-sm text-muted-foreground hover:text-primary"
                >
                  Thoát
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-retro text-sm"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-retro text-sm"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
