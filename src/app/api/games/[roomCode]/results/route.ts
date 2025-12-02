import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;

    await connectDB();

    const room = await Room.findOne({ code: roomCode.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    const startTime = room.startedAt?.getTime() || 0;

    const rankings = [...room.players]
      .map((p) => ({
        visitorId: p.visitorId,
        name: p.name,
        isHost: p.isHost,
        progress: p.progress,
        errors: p.errors || 0,
        finished: p.finishedAt !== null,
        time: p.finishedAt ? (p.finishedAt.getTime() - startTime) / 1000 : null,
        gaveUp: p.progress === -1,
      }))
      .sort((a, b) => {
        if (a.gaveUp && !b.gaveUp) return 1;
        if (!a.gaveUp && b.gaveUp) return -1;
        if (!a.finished && b.finished) return 1;
        if (a.finished && !b.finished) return -1;
        if (a.time !== null && b.time !== null) {
          if (a.time !== b.time) return a.time - b.time;
        }
        return a.errors - b.errors;
      });

    return NextResponse.json({
      status: room.status,
      winnerId: room.winnerId,
      difficulty: room.difficulty,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
      rankings,
    });
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json(
      { error: "Failed to get results" },
      { status: 500 }
    );
  }
}
