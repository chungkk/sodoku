import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { MAX_CHECKS_PER_GAME } from "@/lib/sudoku";
import { clientProgress, isCount, isNotes, isPlayerGrid, readJsonObject } from "@/lib/validation";

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

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    const room = Room.findByCode(roomCode.toUpperCase());

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
      finished: player.finishedAt !== null,
      gaveUp: player.progress === -1,
      checksRemaining: Math.max(0, MAX_CHECKS_PER_GAME - (player.checksUsed ?? 0)),
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
    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { visitorId, currentGrid, notes, elapsedTime, errors, progress } = body;

    if (!roomCode || typeof visitorId !== "string" || !visitorId) {
      return NextResponse.json(
        { error: "roomCode and visitorId are required" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    const storedProgress = progress === undefined ? undefined : clientProgress(progress);
    if (
      storedProgress === null ||
      (currentGrid !== undefined && !isPlayerGrid(currentGrid)) ||
      (notes !== undefined && !isNotes(notes)) ||
      (elapsedTime !== undefined && !isCount(elapsedTime)) ||
      (errors !== undefined && !isCount(errors))
    ) {
      return NextResponse.json({ error: "Invalid game state" }, { status: 400 });
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

    if (room.pausedBy) {
      return NextResponse.json(
        { error: "Game is paused", code: "GAME_PAUSED" },
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
      player.currentGrid = currentGrid as number[][];
    }
    if (notes !== undefined) {
      player.notes = notes;
    }
    // Không cho client hạ thấp số lỗi hay thời gian đã ghi nhận (errors dùng để phân thắng thua khi hoà thời gian)
    if (elapsedTime !== undefined) {
      player.elapsedTime = Math.max(player.elapsedTime || 0, elapsedTime);
    }
    if (errors !== undefined) {
      player.errors = Math.max(player.errors || 0, errors);
    }
    if (storedProgress !== undefined) {
      player.progress = storedProgress;
    }
    player.lastSeen = new Date();

    room.save();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    console.error("Save game state error:", error);
    return NextResponse.json(
      { error: "Failed to save game state" },
      { status: 500 }
    );
  }
}
