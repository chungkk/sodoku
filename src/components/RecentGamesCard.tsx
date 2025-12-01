"use client";

interface RecentGame {
  roomCode: string;
  difficulty: string;
  rank: number;
  completionTime: number | null;
  status: "completed" | "gave_up" | "in_progress";
  pointsChange: number;
  playedAt: string;
}

interface RecentGamesCardProps {
  games: RecentGame[];
}

export function RecentGamesCard({ games }: RecentGamesCardProps) {
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "Dễ";
      case "medium":
        return "TB";
      case "hard":
        return "Khó";
      default:
        return difficulty;
    }
  };

  return (
    <div className="bg-card border border-border p-6 space-y-4">
      <h2 className="font-pixel text-lg text-primary">TRẬN GẦN ĐÂY</h2>

      {games.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-retro text-sm">
          Chưa có trận nào
        </div>
      ) : (
        <div className="space-y-2">
          {games.map((game, index) => (
            <div
              key={`${game.roomCode}-${index}`}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-pixel text-sm w-8 text-center ${
                    game.rank === 1 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  #{game.rank}
                </span>
                <div>
                  <span className={`font-retro text-xs ${getDifficultyColor(game.difficulty)}`}>
                    {getDifficultyText(game.difficulty)}
                  </span>
                  <span className="text-muted-foreground font-retro text-xs ml-2">
                    {formatDate(game.playedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-retro text-xs">
                  {formatTime(game.completionTime)}
                </span>
                <span
                  className={`font-pixel text-sm ${
                    game.pointsChange > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {game.pointsChange > 0 ? "+" : ""}
                  {game.pointsChange}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
