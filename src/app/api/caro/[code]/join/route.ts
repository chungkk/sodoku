import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { visitorId, name } = await request.json();

    if (!visitorId || !name) {
      return NextResponse.json(
        { error: "Missing visitorId or name" },
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
        { error: "Room is not accepting new players" },
        { status: 400 }
      );
    }

    if (room.players.length >= 2) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    const existingPlayer = room.players.find(
      (p: { visitorId: string }) => p.visitorId === visitorId
    );

    if (existingPlayer) {
      existingPlayer.isConnected = true;
    } else {
      room.players.push({
        visitorId,
        name,
        symbol: "O",
        isReady: false,
        isConnected: true,
      });
    }

    room.lastActivityAt = new Date();
    await room.save();

    return NextResponse.json({
      success: true,
      room: {
        code: room.code,
        status: room.status,
        players: room.players,
      },
    });
  } catch (error) {
    console.error("Failed to join caro room:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}
