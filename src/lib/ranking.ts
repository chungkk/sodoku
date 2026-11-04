export interface RankablePlayer {
  visitorId: string;
  progress: number;
  errors: number;
  finishedAt: Date | null;
}

/** progress = 100 chỉ được server gán khi lời giải đúng; người bỏ cuộc cũng có finishedAt nhưng không được xếp hạng. */
export function pickWinnerId(players: RankablePlayer[]): string | null {
  const solved = players
    .filter((p) => p.finishedAt && p.progress === 100)
    .sort((a, b) => {
      const byTime = a.finishedAt!.getTime() - b.finishedAt!.getTime();
      return byTime !== 0 ? byTime : (a.errors || 0) - (b.errors || 0);
    });
  return solved[0]?.visitorId ?? null;
}
