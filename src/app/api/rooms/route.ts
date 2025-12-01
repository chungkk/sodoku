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

    // Auto-leave old room if player is already in one
    if (player.currentRoomCode) {
      const oldRoom = await Room.findOne({ code: player.currentRoomCode });
      if (oldRoom) {
        const playerIndex = oldRoom.players.findIndex(
          (p) => p.toString() === player._id.toString()
        );
        if (playerIndex !== -1) {
          oldRoom.players.splice(playerIndex, 1);
          if (oldRoom.players.length === 0) {
            await Room.deleteOne({ _id: oldRoom._id });
          } else {
            if (oldRoom.hostPlayerId.toString() === player._id.toString() && oldRoom.players.length > 0) {
              oldRoom.hostPlayerId = oldRoom.players[0];
            }
            await oldRoom.save();
          }
        }
      }
      player.currentRoomCode = undefined;
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
        hostPlayerId: player.sessionId,
        players: [
          {
            id: player.sessionId,
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
