import { createHmac, timingSafeEqual } from "node:crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * visitorId là công khai (đối thủ nào cũng thấy), nên không đủ để chứng minh danh tính.
 * Server tự sinh visitorId rồi ký bằng khoá bí mật; người chơi gửi kèm chữ ký này trong mọi hành động.
 */
function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is required");
  }
  return "dev-only-secret";
}

export function generateVisitorId(): string {
  return `guest_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
}

export function signPlayerToken(visitorId: string): string {
  return createHmac("sha256", secret()).update(`player:${visitorId}`).digest("base64url");
}

export function isValidPlayerToken(visitorId: unknown, token: unknown): boolean {
  if (typeof visitorId !== "string" || typeof token !== "string") return false;
  const expected = Buffer.from(signPlayerToken(visitorId));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
