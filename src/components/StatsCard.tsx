"use client";

interface StatsCardProps {
  points: number;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}

export function StatsCard({ points, wins, losses, totalGames, winRate }: StatsCardProps) {
  return (
    <div className="bg-card border border-border p-6 space-y-4">
      <h2 className="font-pixel text-lg text-primary">THỐNG KÊ</h2>

      <div className="text-center py-4">
        <div className="font-pixel text-4xl text-primary">{points}</div>
        <div className="text-muted-foreground font-retro text-sm mt-1">ĐIỂM</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background/50 border border-border p-3 text-center">
          <div className="font-pixel text-2xl text-green-500">{wins}</div>
          <div className="text-muted-foreground font-retro text-xs mt-1">THẮNG</div>
        </div>
        <div className="bg-background/50 border border-border p-3 text-center">
          <div className="font-pixel text-2xl text-red-500">{losses}</div>
          <div className="text-muted-foreground font-retro text-xs mt-1">THUA</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-retro">Tổng trận:</span>
          <span className="font-retro">{totalGames}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-retro">Tỷ lệ thắng:</span>
          <span className="font-retro">{winRate}%</span>
        </div>
      </div>

      {/* Win rate progress bar */}
      <div className="w-full bg-background/50 border border-border h-2">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${winRate}%` }}
        />
      </div>
    </div>
  );
}
