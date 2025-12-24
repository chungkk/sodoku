import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom, { ICaroPlayer } from "@/models/CaroRoom";

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { visitorId } = await request.json();

    await connectDB();

    const room = await CaroRoom.findOne({ code });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in playing state" },
        { status: 400 }
      );
    }

    if (!room.isPaused) {
      return NextResponse.json(
        { error: "Game is not paused" },
        { status: 400 }
      );
    }

    // Kiểm tra xem player có trong phòng không
    const player = room.players.find((p: ICaroPlayer) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json(
        { error: "Player not in room" },
        { status: 403 }
      );
    }

    // Cập nhật lại turnStartedAt dựa trên remainingTime
    const now = new Date();
    if (room.remainingTime !== undefined) {
      const newTurnStartTime = new Date(now.getTime() - (300 - room.remainingTime) * 1000);
      room.turnStartedAt = newTurnStartTime;
    }

    // Cập nhật trạng thái resume
    room.isPaused = false;
    room.pausedBy = null;
    room.pausedAt = undefined;
    room.remainingTime = undefined;

    await room.save();

    return NextResponse.json({
      success: true,
      isPaused: false,
      turnStartedAt: room.turnStartedAt,
      remainingTime: room.remainingTime,
    });
  } catch (error) {
    console.error("Failed to resume game:", error);
    return NextResponse.json(
      { error: "Failed to resume game" },
      { status: 500 }
    );
  }
}
