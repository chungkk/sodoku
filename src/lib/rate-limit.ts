/**
 * Bộ giới hạn lưu lượng dạng sliding-window approximation kết hợp LRU eviction,
 * nằm trong bộ nhớ của process (đủ dùng vì app chạy một process).
 * - Tránh burst 2x ở ranh giới cửa sổ bằng trọng số của cửa sổ trước.
 * - Khi chạm maxKeys, xoá khóa cũ nhất thay vì từ chối toàn bộ người dùng mới.
 */
interface Bucket {
  windowIndex: number;
  prevCount: number;
  currCount: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
    private readonly maxKeys = 50_000
  ) {}

  allow(key: string): boolean {
    const now = this.now();
    const windowIndex = Math.floor(now / this.windowMs);
    const elapsedInWindow = now - windowIndex * this.windowMs;
    const prevWeight = (this.windowMs - elapsedInWindow) / this.windowMs;

    const existing = this.buckets.get(key);
    let bucket: Bucket;

    if (!existing) {
      if (this.buckets.size >= this.maxKeys) {
        const oldestKey = this.buckets.keys().next().value;
        if (oldestKey !== undefined) this.buckets.delete(oldestKey);
      }
      bucket = { windowIndex, prevCount: 0, currCount: 0 };
    } else {
      // Làm mới vị trí LRU bằng cách xoá rồi ghi lại ở cuối Map
      this.buckets.delete(key);
      if (existing.windowIndex === windowIndex) {
        bucket = existing;
      } else if (existing.windowIndex === windowIndex - 1) {
        bucket = { windowIndex, prevCount: existing.currCount, currCount: 0 };
      } else {
        bucket = { windowIndex, prevCount: 0, currCount: 0 };
      }
    }

    const effectiveCount = bucket.prevCount * prevWeight + bucket.currCount;
    if (effectiveCount + 1 > this.limit) {
      this.buckets.set(key, bucket);
      return false;
    }

    bucket.currCount += 1;
    this.buckets.set(key, bucket);
    return true;
  }
}
