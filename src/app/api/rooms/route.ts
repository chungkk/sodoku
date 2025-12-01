import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";
import { generateRoomCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const body = await request.json();
    const { difficulty = "medium", maxPlayers = 4 } = body;

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 }
      );
    }

    if (maxPlayers < 2 || maxPlayers > 4) {
      return NextResponse.json(
        { error: "Max players must be 2-4" },
        { status: 400 }
      );
    }

    await connectDB();

    const player = await Player.findOne({ sessionId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (player.currentRoomCode) {
      return NextResponse.json(
        { error: "Already in a room" },
        { status: 400 }
      );
    }

    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await Room.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Could not generate unique room code" },
        { status: 500 }
      );
    }

    const room = await Room.create({
      code,
      hostPlayerId: player._id,
      players: [player._id],
      status: "waiting",
      settings: {
        difficulty,
        maxPlayers,
      },
    });

    player.currentRoomCode = code;
    await player.save();

    return NextResponse.json(
      {
        code: room.code,
        hostPlayerId: room.hostPlayerId.toString(),
        players: [
          {
            id: player._id.toString(),
            displayName: player.displayName,
            isReady: false,
            isConnected: true,
          },
        ],
        status: room.status,
        settings: room.settings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
