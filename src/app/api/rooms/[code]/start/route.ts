import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Puzzle from "@/models/Puzzle";
import { generatePuzzle } from "@/lib/sudoku";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { visitorId } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitorId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", code: "ROOM_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (room.hostId !== visitorId) {
      return NextResponse.json(
        { error: "Only the host can start the game", code: "NOT_HOST" },
        { status: 403 }
      );
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started or finished", code: "GAME_ALREADY_STARTED" },
        { status: 400 }
      );
    }

    if (!room.canStart()) {
      return NextResponse.json(
        { error: "Not enough ready players to start", code: "NOT_READY" },
        { status: 400 }
      );
    }

    const { grid, solution } = generatePuzzle(room.difficulty);

    const puzzle = new Puzzle({
      grid,
      solution,
      difficulty: room.difficulty,
      givenCells: grid.flat().filter((c) => c !== 0).length,
    });
    await puzzle.save();

    room.puzzleId = puzzle._id;
    room.status = "playing";
    room.startedAt = new Date();

    room.players.forEach((player) => {
      player.progress = 0;
      player.errors = 0;
      player.currentGrid = grid.map((row) => [...row]);
      player.finishedAt = null;
    });

    await room.save();

    return NextResponse.json({
      success: true,
      puzzle: grid,
      startedAt: room.startedAt,
      players: room.players.map((p) => ({
        visitorId: p.visitorId,
        name: p.name,
        isHost: p.isHost,
        progress: p.progress,
        errors: p.errors,
      })),
    });
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
