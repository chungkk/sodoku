import { randomInt } from "node:crypto";

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 20;
const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Sinh mã phòng 6 ký tự bằng CSPRNG (36^6 ≈ 2.17 tỷ tổ hợp). */
export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS.charAt(randomInt(ROOM_CODE_CHARS.length));
  }
  return code;
}

export function isValidRoomCode(code: unknown): code is string {
  return typeof code === "string" && /^[A-Za-z0-9]{6}$/.test(code);
}

/** Đọc JSON body dạng object phẳng; từ chối null, mảng hoặc primitive bằng null để API trả 400. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Tên đã trim (2-20 ký tự), hoặc null nếu không hợp lệ. */
export function cleanPlayerName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length >= MIN_NAME_LENGTH && trimmed.length <= MAX_NAME_LENGTH ? trimmed : null;
}

/** Nếu tên đã tồn tại trong phòng (không phân biệt hoa/thường), tự thêm hậu tố (2), (3)... và giữ <= MAX_NAME_LENGTH. */
export function uniquePlayerName(desiredName: string, existingNames: string[]): string {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  const base = desiredName.trim();
  if (!taken.has(base.toLowerCase())) return base;

  for (let n = 2; n < 100; n++) {
    const suffix = ` (${n})`;
    const candidate = `${base.slice(0, MAX_NAME_LENGTH - suffix.length).trimEnd()}${suffix}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return base.slice(0, MAX_NAME_LENGTH);
}

function isNineByNine(value: unknown, isCell: (cell: unknown) => boolean): boolean {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    value.every((row) => Array.isArray(row) && row.length === 9 && row.every(isCell))
  );
}

function isDigit(value: unknown, min: number): boolean {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= 9;
}

/** Bàn 9x9 đã điền đủ số: mỗi ô là số nguyên 0-9. */
export function isNumberGrid(value: unknown): value is number[][] {
  return isNineByNine(value, (cell) => isDigit(cell, 0));
}

/** Bàn 9x9 đang chơi dở: ô trống có thể là null. */
export function isPlayerGrid(value: unknown): value is (number | null)[][] {
  return isNineByNine(value, (cell) => cell === null || isDigit(cell, 0));
}

/** Ghi chú của người chơi: mảng rỗng, hoặc 9x9 ô, mỗi ô tối đa 9 số 1-9. */
export function isNotes(value: unknown): value is number[][][] {
  if (Array.isArray(value) && value.length === 0) return true;
  return isNineByNine(
    value,
    (cell) => Array.isArray(cell) && cell.length <= 9 && cell.every((n) => isDigit(n, 1))
  );
}

/** Bộ đếm không âm do client báo (số lỗi, số giây). */
export function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10_000_000;
}

/**
 * Tiến độ client được phép báo: 0-99. Chỉ server gán 100 (giải đúng) và -1 (bỏ cuộc),
 * nên báo 100 sẽ bị hạ về 99. Trả về null nếu không phải số hợp lệ.
 */
export function clientProgress(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) return null;
  return Math.min(99, Math.round(value));
}
