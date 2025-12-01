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

    if (player.currentRoomCode && player.currentRoomCode !== code.toUpperCase()) {
      return NextResponse.json(
        { error: "Already in another room" },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 400 }
      );
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    const alreadyInRoom = room.players.some(
      (p) => p.toString() === player._id.toString()
    );

    if (!alreadyInRoom) {
      room.players.push(player._id);
      await room.save();

      player.currentRoomCode = room.code;
      await player.save();
    }

    const populatedRoom = await Room.findById(room._id).populate(
      "players",
      "displayName sessionId connectionStatus"
    );

    const players = populatedRoom!.players.map((p: any) => ({
      id: p._id.toString(),
      displayName: p.displayName,
      isReady: false,
      isConnected: p.connectionStatus === "connected",
    }));

    return NextResponse.json({
      code: populatedRoom!.code,
      hostPlayerId: populatedRoom!.hostPlayerId.toString(),
      players,
      status: populatedRoom!.status,
      settings: populatedRoom!.settings,
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
