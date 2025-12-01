import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() }).populate(
      "players",
      "displayName sessionId connectionStatus"
    );

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const players = room.players.map((p: any) => ({
      id: p._id.toString(),
      displayName: p.displayName,
      isReady: false,
      isConnected: p.connectionStatus === "connected",
    }));

    return NextResponse.json({
      code: room.code,
      hostPlayerId: room.hostPlayerId.toString(),
      players,
      status: room.status,
      settings: room.settings,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
