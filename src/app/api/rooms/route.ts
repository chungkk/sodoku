import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import { Difficulty } from "@/models/Puzzle";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, hostName, difficulty, userId } = body;

    if (!visitorId || !hostName) {
      return NextResponse.json(
        { error: "visitorId and hostName are required" },
        { status: 400 }
      );
    }

    const validDifficulties: Difficulty[] = ["easy", "medium", "hard"];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.createRoom(
      visitorId,
      hostName,
      difficulty || "medium",
      userId || null
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
    console.error("Create room error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create room", details: errorMessage },
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
