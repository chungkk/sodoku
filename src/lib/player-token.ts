import { createHmac, timingSafeEqual } from "node:crypto";
import { v4 as uuidv4 } from "uuid";

/** Thời hạn phiên khách: 30 ngày; hết hạn thì client tự xin phiên mới. */
export const PLAYER_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * visitorId là công khai (đối thủ nào cũng thấy), nên không đủ để chứng minh danh tính.
 * Server tự sinh visitorId rồi ký bằng khoá bí mật kèm mốc hết hạn; người chơi gửi kèm chữ ký này trong mọi hành động.
 */
function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is required");
  }
  return "dev-only-secret";
}

function hmacFor(visitorId: string, exp: number): string {
  return createHmac("sha256", secret()).update(`player:${visitorId}:${exp}`).digest("base64url");
}

export function generateVisitorId(): string {
  return `guest_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
}

export function signPlayerToken(visitorId: string, nowMs = Date.now()): string {
  const exp = Math.floor(nowMs / 1000) + PLAYER_TOKEN_TTL_SECONDS;
  return `${exp}.${hmacFor(visitorId, exp)}`;
}

export function parseTokenExpiryMs(token: unknown): number | null {
  if (typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const expStr = token.slice(0, dot);
  if (!/^\d+$/.test(expStr)) return null;
  const exp = Number(expStr);
  return Number.isSafeInteger(exp) ? exp * 1000 : null;
}

export function isValidPlayerToken(visitorId: unknown, token: unknown, nowMs = Date.now()): boolean {
  if (typeof visitorId !== "string" || typeof token !== "string") return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(expStr) || !sig) return false;

  const exp = Number(expStr);
  if (!Number.isSafeInteger(exp) || exp * 1000 <= nowMs) return false;

  const expected = Buffer.from(hmacFor(visitorId, exp));
  const actual = Buffer.from(sig);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
