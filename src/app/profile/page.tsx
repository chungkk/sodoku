"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCard } from "@/components/ProfileCard";
import { StatsCard } from "@/components/StatsCard";
import { RecentGamesCard } from "@/components/RecentGamesCard";
import { Button } from "@/components/ui/button";

interface ProfileData {
  id: string;
  email: string;
  displayName: string;
  points: number;
  stats: {
    wins: number;
    losses: number;
    totalGames: number;
    winRate: number;
  };
  recentGames: Array<{
    roomCode: string;
    difficulty: string;
    rank: number;
    completionTime: number | null;
    status: "completed" | "gave_up" | "in_progress";
    pointsChange: number;
    playedAt: string;
  }>;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated) return;

      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.error || "Không thể tải thông tin");
        }
      } catch {
        setError("Lỗi kết nối");
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleUpdateProfile = async (data: { displayName?: string; password?: string }) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName: result.data.displayName,
              }
            : null
        );
        await refreshUser();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch {
      return { success: false, error: "Lỗi kết nối" };
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="font-retro text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-card border border-border p-6 text-center space-y-4">
          <p className="text-destructive font-retro">{error}</p>
          <Button onClick={() => router.push("/")} className="font-retro">
            VỀ TRANG CHỦ
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-pixel text-2xl text-primary">PROFILE</h1>
          <Link href="/">
            <Button variant="outline" className="font-retro">
              VỀ TRANG CHỦ
            </Button>
          </Link>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ProfileCard
              displayName={profile.displayName}
              email={profile.email}
              createdAt={profile.createdAt}
              onUpdateProfile={handleUpdateProfile}
            />
            <StatsCard
              points={profile.points}
              wins={profile.stats.wins}
              losses={profile.stats.losses}
              totalGames={profile.stats.totalGames}
              winRate={profile.stats.winRate}
            />
          </div>

          {/* Right column */}
          <div>
            <RecentGamesCard games={profile.recentGames} />
          </div>
        </div>
      </div>
    </div>
  );
}
