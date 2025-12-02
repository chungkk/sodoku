"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ProfileCard } from "@/components/ProfileCard";
import { StatsCard } from "@/components/StatsCard";
import { RecentGamesCard } from "@/components/RecentGamesCard";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  stats: {
    totalGames: number;
    wins: number;
    bestTime: number | null;
  };
  createdAt: string;
}

interface GameRecord {
  date: string;
  mode: "practice" | "solo";
  difficulty: string;
  time: number;
  errors: number;
  won: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { player, isGuest, clearSession } = usePlayer();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session && !player) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetch("/api/player/history").then((r) => r.json()),
      ])
        .then(([profileData, historyData]) => {
          if (profileData.id) {
            setProfile(profileData);
          }
          if (historyData.games) {
            setGames(historyData.games);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session, status, player, router]);

  const handleLogout = async () => {
    if (isGuest) {
      clearSession();
      router.push("/");
    } else {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (isGuest && player) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProfileCard
          displayName={player.name}
          email=""
          createdAt={new Date().toISOString()}
          isGuest
        />

        <div className="mt-6 space-y-4">
          <p className="text-center text-gray-600">
            Đăng ký tài khoản để lưu tiến trình và xem thống kê chi tiết!
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/register")}>
              Đăng ký
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">😢</div>
          <p className="text-gray-600">Không thể tải hồ sơ</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Đăng nhập lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <ProfileCard
        displayName={profile.displayName}
        email={profile.email}
        createdAt={profile.createdAt}
      />

      <StatsCard stats={profile.stats} />

      <RecentGamesCard games={games} />

      <div className="text-center">
        <Button variant="ghost" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
