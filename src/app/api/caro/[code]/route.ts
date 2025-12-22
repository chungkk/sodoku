import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    await connectDB();

    const room = await CaroRoom.findOne({ code });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      code: room.code,
      status: room.status,
      players: room.players,
      board: room.board,
      currentTurn: room.currentTurn,
      winnerId: room.winnerId,
      createdAt: room.createdAt,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
    });
  } catch (error) {
    console.error("Failed to fetch caro room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
