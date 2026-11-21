import { NextRequest, NextResponse } from "next/server";
import Puzzle from "@/models/Puzzle";
import Room from "@/models/Room";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { countWrongCells, MAX_CHECKS_PER_GAME } from "@/lib/sudoku";
import { isNumberGrid, readJsonObject } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

/**
 * Đếm số ô người chơi đã điền sai so với đáp án (không tiết lộ vị trí ô sai hay đáp án).
 * Giới hạn MAX_CHECKS_PER_GAME lần mỗi người mỗi ván.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { visitorId, grid } = body;

    if (!roomCode || typeof visitorId !== "string" || !visitorId || !grid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    if (!isNumberGrid(grid)) {
      return NextResponse.json({ error: "Invalid grid" }, { status: 400 });
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

    const used = player.checksUsed ?? 0;
    if (used >= MAX_CHECKS_PER_GAME) {
      return NextResponse.json(
        { error: "No checks remaining", code: "NO_CHECKS_LEFT", checksRemaining: 0 },
        { status: 400 }
      );
    }

    const puzzle = Puzzle.findById(room.puzzleId);
    if (!puzzle) {
      return NextResponse.json(
        { error: "Puzzle not found" },
        { status: 500 }
      );
    }

    const wrongCount = countWrongCells(grid, puzzle.grid, puzzle.solution);
    player.checksUsed = used + 1;
    room.save();

    return NextResponse.json({
      wrongCount,
      checksRemaining: Math.max(0, MAX_CHECKS_PER_GAME - player.checksUsed),
    });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    console.error("Check grid error:", error);
    return NextResponse.json(
      { error: "Failed to check grid" },
      { status: 500 }
    );
  }
}
