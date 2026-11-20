import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;

    const room = Room.findByCode(roomCode.toUpperCase());

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    const playersProgress = room.players.map((p) => ({
      visitorId: p.visitorId,
      name: p.name,
      progress: p.progress,
      errors: p.errors,
      isConnected: p.isConnected,
      finishedAt: p.finishedAt,
    }));

    return NextResponse.json({
      status: room.status,
      players: playersProgress,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Failed to get progress" },
      { status: 500 }
    );
  }
}
