import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { clientProgress, isCount, isPlayerGrid } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId, errors, currentGrid } = body;
    const progress = clientProgress(body.progress);

    if (!roomCode || !visitorId) {
      return NextResponse.json(
        { error: "roomCode and visitorId are required" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    if (
      progress === null ||
      !isCount(errors) ||
      (currentGrid !== undefined && !isPlayerGrid(currentGrid))
    ) {
      return NextResponse.json({ error: "Invalid progress data" }, { status: 400 });
    }

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

    if (player.finishedAt) {
      return NextResponse.json(
        { error: "Player already finished", code: "ALREADY_FINISHED" },
        { status: 400 }
      );
    }

    player.progress = progress;
    player.errors = errors;
    if (currentGrid) {
      player.currentGrid = currentGrid as number[][];
    }
    player.lastSeen = new Date();

    room.save();

    return NextResponse.json({
      success: true,
      progress,
      errors,
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;

    const room = Room.findByCode(roomCode.toUpperCase());

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    const playersProgress = room.players.map((p) => ({
      visitorId: p.visitorId,
      name: p.name,
      progress: p.progress,
      errors: p.errors,
      isConnected: p.isConnected,
      finishedAt: p.finishedAt,
    }));

    return NextResponse.json({
      status: room.status,
      players: playersProgress,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Failed to get progress" },
      { status: 500 }
    );
  }
}
