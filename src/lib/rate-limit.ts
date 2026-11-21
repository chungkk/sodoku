/** Giới hạn theo cửa sổ cố định, nằm trong bộ nhớ của process; đủ dùng vì app chỉ chạy một process. */
export class RateLimiter {
  private counts = new Map<string, number>();
  private windowStart: number;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now
  ) {
    this.windowStart = now();
  }

  allow(key: string): boolean {
    const now = this.now();
    if (now - this.windowStart >= this.windowMs) {
      // Xoá hết khi qua cửa sổ mới để Map không lớn dần
      this.counts.clear();
      this.windowStart = now;
    }
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    return count <= this.limit;
  }
}
