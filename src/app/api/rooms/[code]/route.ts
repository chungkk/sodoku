import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: room.code,
      hostId: room.hostId,
      difficulty: room.difficulty,
      players: room.players.map((p) => ({
        visitorId: p.visitorId,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isConnected: p.isConnected,
        progress: p.progress,
        errors: p.errors,
      })),
      status: room.status,
      puzzleId: room.puzzleId,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
      winnerId: room.winnerId,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to get room" },
      { status: 500 }
    );
  }
}
