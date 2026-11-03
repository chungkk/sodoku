import { NextResponse } from "next/server";
import { isValidPlayerToken } from "./player-token";

export const PLAYER_TOKEN_HEADER = "x-player-token";

/** Trả về response 401 nếu request không chứng minh được là của visitorId này, ngược lại trả về null. */
export function denyUnlessPlayer(request: Request, visitorId: unknown): NextResponse | null {
  if (isValidPlayerToken(visitorId, request.headers.get(PLAYER_TOKEN_HEADER))) return null;
  return NextResponse.json(
    { error: "Invalid player token", code: "UNAUTHORIZED" },
    { status: 401 }
  );
}
