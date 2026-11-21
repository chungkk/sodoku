import { NextRequest, NextResponse } from "next/server";
import Room from "@/models/Room";
import Puzzle from "@/models/Puzzle";
import { isSolutionOf } from "@/lib/sudoku";
import { isNumberGrid } from "@/lib/validation";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { broadcast, sudokuSocketRoom } from "@/lib/realtime";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId, grid } = body;

    if (!roomCode || !visitorId || !grid) {
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

    // Bàn của mọi người đang bị khoá thì không ai được nộp, kể cả người đã dừng ván
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
        { error: "Player already finished" },
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

    if (!isSolutionOf(grid, puzzle.grid)) {
      return NextResponse.json({
        success: false,
        message: "Puzzle is not complete or has errors",
      });
    }

    player.finishedAt = new Date();
    player.progress = 100;
    player.currentGrid = grid;

    room.finishIfAllDone();
    const allFinished = room.isFinished;

    room.save();

    const elapsed = (player.finishedAt.getTime() - room.startedAt!.getTime()) / 1000;
    const socketRoom = sudokuSocketRoom(room.code);
    broadcast(socketRoom, "player_completed", {
      visitorId,
      name: player.name,
      time: elapsed,
      errors: player.errors,
    });
    if (allFinished) {
      broadcast(socketRoom, "game_ended", { winnerId: room.winnerId, reason: "completed" });
    }

    return NextResponse.json({
      success: true,
      finished: true,
      time: elapsed,
      errors: player.errors,
      gameEnded: allFinished,
      winnerId: room.winnerId,
    });
  } catch (error) {
    console.error("Complete game error:", error);
    return NextResponse.json(
      { error: "Failed to complete game" },
      { status: 500 }
    );
  }
}
