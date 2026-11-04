import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
import { denyUnlessPlayer } from "@/lib/player-auth";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { visitorId, name } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    if (!visitorId || !name) {
      return NextResponse.json(
        { error: "visitorId and name are required" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    const room = Room.findByCode(code.toUpperCase());

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started", code: "GAME_ALREADY_STARTED" },
        { status: 400 }
      );
    }

    if (room.players.length >= 4) {
      return NextResponse.json(
        { error: "Room is full", code: "ROOM_FULL" },
        { status: 400 }
      );
    }

    const existingPlayer = room.players.find((p) => p.visitorId === visitorId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      existingPlayer.lastSeen = new Date();
      room.save();

      return NextResponse.json({
        success: true,
        rejoined: true,
        room: {
          code: room.code,
          hostId: room.hostId,
          difficulty: room.difficulty,
          players: room.players,
          status: room.status,
        },
      });
    }

    const added = room.addPlayer(visitorId, name);
    if (!added) {
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 400 }
      );
    }

    room.save();

    return NextResponse.json({
      success: true,
      rejoined: false,
      room: {
        code: room.code,
        hostId: room.hostId,
        difficulty: room.difficulty,
        players: room.players,
        status: room.status,
      },
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}
