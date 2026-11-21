import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
import { Difficulty } from "@/models/Puzzle";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { cleanPlayerName, readJsonObject } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { visitorId, hostName: rawHostName, difficulty } = body;
    const hostName = cleanPlayerName(rawHostName);

    if (typeof visitorId !== "string" || !visitorId || !hostName) {
      return NextResponse.json(
        { error: "visitorId and valid hostName are required" },
        { status: 400 }
      );
    }

    const validDifficulties: Difficulty[] = ["easy", "medium", "hard"];
    if (difficulty !== undefined && difficulty !== null && !validDifficulties.includes(difficulty as Difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    const room = Room.createRoom(
      visitorId,
      hostName,
      (difficulty as Difficulty) || "medium"
    );

    return NextResponse.json({
      code: room.code,
      hostId: room.hostId,
      difficulty: room.difficulty,
      players: room.players,
      status: room.status,
      createdAt: room.createdAt,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
