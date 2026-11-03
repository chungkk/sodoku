import { NextRequest, NextResponse } from "next/server";
import CaroRoom from "@/models/CaroRoom";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = CaroRoom.findByCode(code);

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
      turnStartedAt: room.turnStartedAt,
    });
  } catch (error) {
    console.error("Failed to fetch caro room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
