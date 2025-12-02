import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { visitorId } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitorId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    const playerIndex = room.players.findIndex((p) => p.visitorId === visitorId);
    if (playerIndex === -1) {
      return NextResponse.json(
        { error: "Player not in room", code: "NOT_IN_ROOM" },
        { status: 400 }
      );
    }

    const wasHost = room.players[playerIndex].isHost;
    room.removePlayer(visitorId);

    if (room.players.length === 0) {
      await Room.deleteOne({ _id: room._id });
      return NextResponse.json({
        success: true,
        roomDeleted: true,
      });
    }

    await room.save();

    return NextResponse.json({
      success: true,
      roomDeleted: false,
      newHostId: wasHost && room.players.length > 0 ? room.hostId : null,
      remainingPlayers: room.players.length,
    });
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}
