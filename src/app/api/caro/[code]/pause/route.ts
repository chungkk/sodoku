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

    // Kiểm tra xem player có trong phòng không
    const player = room.players.find((p: ICaroPlayer) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json(
        { error: "Player not in room" },
        { status: 403 }
      );
    }

    // Tính thời gian còn lại
    const now = new Date();
    let remainingTime = 300; // 5 phút mặc định
    
    if (room.turnStartedAt) {
      const elapsed = Math.floor((now.getTime() - room.turnStartedAt.getTime()) / 1000);
      remainingTime = Math.max(0, 300 - elapsed);
    }

    // Cập nhật trạng thái pause
    room.isPaused = true;
    room.pausedBy = visitorId;
    room.pausedAt = now;
    room.remainingTime = remainingTime;
    room.lastActivityAt = now;

    await room.save();

    return NextResponse.json({
      success: true,
      isPaused: true,
      pausedBy: visitorId,
      pausedByName: player.name,
      remainingTime,
    });
  } catch (error) {
    console.error("Failed to pause game:", error);
    return NextResponse.json(
      { error: "Failed to pause game" },
      { status: 500 }
    );
  }
}
