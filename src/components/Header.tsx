"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-shadow">
              <span className="font-pixel text-sm text-primary-foreground">S</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Sudoku
            </span>
          </Link>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/practice" 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              Luyện tập
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              Đấu trường
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all"
                >
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:block">{user.displayName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="text-sm font-medium bg-primary hover:bg-primary/90"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
