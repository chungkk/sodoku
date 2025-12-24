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
  try {
    await connectDB();

    const rooms = await Room.find({
      status: { $in: ["waiting", "playing"] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      rooms: rooms.map((room) => ({
        code: room.code,
        status: room.status,
        difficulty: room.difficulty,
        playerCount: room.players.length,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
