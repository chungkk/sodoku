import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";
import { createEmptyBoard } from "@/lib/caro";

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { visitorId } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { error: "Missing visitorId" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await CaroRoom.findOne({ code });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 400 }
      );
    }

    if (room.players.length !== 2) {
      return NextResponse.json(
        { error: "Need 2 players to start" },
        { status: 400 }
      );
    }

    const allReady = room.players.every((p: { isReady: boolean }) => p.isReady);
    if (!allReady) {
      return NextResponse.json(
        { error: "Not all players are ready" },
        { status: 400 }
      );
    }

    room.status = "playing";
    room.startedAt = new Date();
    room.turnStartedAt = new Date();
    room.board = createEmptyBoard();
    room.currentTurn = "X";
    room.moves = [];
    room.lastActivityAt = new Date();

    await room.save();

    return NextResponse.json({
      success: true,
      room: {
        code: room.code,
        status: room.status,
        startedAt: room.startedAt,
      },
    });
  } catch (error) {
    console.error("Failed to start caro game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
