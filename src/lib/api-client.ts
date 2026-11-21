"use client";

export const GUEST_SESSION_KEY = "sudoku_guest_session";
const PLAYER_TOKEN_HEADER = "x-player-token";

function storedToken(): string | null {
  try {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    return stored ? JSON.parse(stored).token ?? null : null;
  } catch {
    return null;
  }
}

/** fetch kèm token của người chơi hiện tại. */
export function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = storedToken();
  if (token) headers.set(PLAYER_TOKEN_HEADER, token);
  return fetch(url, { ...init, headers });
}

/** Xin server cấp danh tính khách mới (visitorId kèm chữ ký). */
export async function requestGuestSession(
  name: string
): Promise<{ name: string; visitorId: string; token: string }> {
  const response = await fetch("/api/player/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create session");
  }
  return data;
}
