import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { broadcast, sudokuSocketRoom } from "@/lib/realtime";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId } = body;

    if (!roomCode || !visitorId) {
      return NextResponse.json(
        { error: "roomCode and visitorId are required" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    const room = Room.findByCode(roomCode.toUpperCase());

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (room.status !== "playing") {
      return NextResponse.json(
        { error: "Game not in progress", code: "GAME_NOT_STARTED" },
        { status: 400 }
      );
    }

    const player = room.players.find((p) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json(
        { error: "Player not in room", code: "NOT_IN_ROOM" },
        { status: 400 }
      );
    }

    const wasPauser = room.pausedBy === visitorId;
    if (!room.giveUp(visitorId)) {
      return NextResponse.json(
        { error: "Player already finished", code: "ALREADY_FINISHED" },
        { status: 400 }
      );
    }

    room.save();

    const socketRoom = sudokuSocketRoom(room.code);
    broadcast(socketRoom, "player_gave_up", { visitorId, name: player.name });
    if (wasPauser) {
      broadcast(socketRoom, "game_paused", { visitorId, name: player.name, paused: false });
    }
    if (room.isFinished) {
      broadcast(socketRoom, "game_ended", { winnerId: room.winnerId, reason: "all_gave_up" });
    }

    return NextResponse.json({
      success: true,
      gameEnded: room.isFinished,
      winnerId: room.winnerId,
    });
  } catch (error) {
    console.error("Give up error:", error);
    return NextResponse.json(
      { error: "Failed to give up" },
      { status: 500 }
    );
  }
}
