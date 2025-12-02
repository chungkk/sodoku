import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Puzzle from "@/models/Puzzle";
import { findConflicts } from "@/lib/sudoku";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId, row, col, value, currentGrid } = body;

    if (!roomCode || !visitorId || row === undefined || col === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const puzzle = await Puzzle.findById(room.puzzleId);
    if (!puzzle) {
      return NextResponse.json(
        { error: "Puzzle not found" },
        { status: 500 }
      );
    }

    if (puzzle.grid[row][col] !== 0) {
      return NextResponse.json(
        { error: "Cannot modify given cell", code: "INVALID_MOVE" },
        { status: 400 }
      );
    }

    let isValid = true;
    let conflicts: { row: number; col: number }[] = [];
    let isCorrect = false;

    if (value !== null && value !== 0) {
      conflicts = findConflicts(currentGrid || player.currentGrid, row, col, value);
      isValid = conflicts.length === 0;
      isCorrect = puzzle.solution[row][col] === value;

      if (!isValid || !isCorrect) {
        player.errors = (player.errors || 0) + 1;
        await room.save();
      }
    }

    return NextResponse.json({
      valid: isValid,
      correct: isCorrect,
      conflicts,
      totalErrors: player.errors,
    });
  } catch (error) {
    console.error("Validate cell error:", error);
    return NextResponse.json(
      { error: "Failed to validate cell" },
      { status: 500 }
    );
  }
}
