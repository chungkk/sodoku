import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");

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

    const player = room.players.find((p) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json(
        { error: "Player not in room", code: "NOT_IN_ROOM" },
        { status: 400 }
      );
    }

    const hasState = player.currentGrid && player.currentGrid.length > 0;

    return NextResponse.json({
      hasState,
      currentGrid: player.currentGrid || [],
      notes: player.notes || [],
      elapsedTime: player.elapsedTime || 0,
      errors: player.errors || 0,
      progress: player.progress || 0,
    });
  } catch (error) {
    console.error("Get game state error:", error);
    return NextResponse.json(
      { error: "Failed to get game state" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId, currentGrid, notes, elapsedTime, errors, progress } = body;

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

    if (player.finishedAt) {
      return NextResponse.json(
        { error: "Player already finished", code: "ALREADY_FINISHED" },
        { status: 400 }
      );
    }

    if (currentGrid !== undefined) {
      player.currentGrid = currentGrid;
    }
    if (notes !== undefined) {
      player.notes = notes;
    }
    if (elapsedTime !== undefined) {
      player.elapsedTime = elapsedTime;
    }
    if (errors !== undefined) {
      player.errors = errors;
    }
    if (progress !== undefined) {
      player.progress = progress;
    }
    player.lastSeen = new Date();

    await room.save();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Save game state error:", error);
    return NextResponse.json(
      { error: "Failed to save game state" },
      { status: 500 }
    );
  }
}
