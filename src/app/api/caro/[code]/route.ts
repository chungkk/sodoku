import { NextRequest, NextResponse } from "next/server";
import CaroRoom from "@/models/CaroRoom";
import { isValidRoomCode } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!isValidRoomCode(code)) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }

    const room = CaroRoom.findByCode(code);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const last = room.moves.length > 0 ? room.moves[room.moves.length - 1] : null;

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
      pausedBy: room.pausedBy,
      pausedAt: room.pausedAt,
      lastMove: last ? { row: last.row, col: last.col } : null,
    });
  } catch (error) {
    console.error("Failed to fetch caro room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
