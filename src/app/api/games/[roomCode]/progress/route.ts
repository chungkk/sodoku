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
      time:
        p.progress === 100 && p.finishedAt && room.startedAt
          ? Math.max(0, (p.finishedAt.getTime() - room.startedAt.getTime()) / 1000)
          : null,
    }));

    return NextResponse.json({
      status: room.status,
      startedAt: room.startedAt,
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
