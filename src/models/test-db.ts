import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Trỏ model tới DB tạm khi chạy test, để test không bao giờ đụng file DB thật. */
export const testDbDir = mkdtempSync(path.join(tmpdir(), "solo-test-"));
process.env.DATABASE_PATH = path.join(testDbDir, "test.db");
