import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId, progress, errors, currentGrid } = body;

    if (!roomCode || !visitorId) {
      return NextResponse.json(
        { error: "roomCode and visitorId are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: roomCode.toUpperCase() });

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

    player.progress = progress;
    player.errors = errors;
    if (currentGrid) {
      player.currentGrid = currentGrid;
    }
    player.lastSeen = new Date();

    await room.save();

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

    await connectDB();

    const room = await Room.findOne({ code: roomCode.toUpperCase() });

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
