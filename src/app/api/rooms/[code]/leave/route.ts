import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const { code } = await params;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    await connectDB();

    const player = await Player.findOne({ sessionId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const playerIndex = room.players.findIndex(
      (p) => p.toString() === player._id.toString()
    );

    if (playerIndex === -1) {
      return NextResponse.json(
        { error: "Not in this room" },
        { status: 400 }
      );
    }

    room.players.splice(playerIndex, 1);

    const isHost = room.hostPlayerId.toString() === player._id.toString();
    let newHostId: string | null = null;

    if (isHost && room.players.length > 0) {
      room.hostPlayerId = room.players[0];
      newHostId = room.players[0].toString();
    }

    if (room.players.length === 0) {
      await Room.deleteOne({ _id: room._id });
    } else {
      await room.save();
    }

    player.currentRoomCode = undefined;
    await player.save();

    return NextResponse.json({
      success: true,
      newHostId,
      roomDeleted: room.players.length === 0,
    });
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
