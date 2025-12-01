import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";
import Puzzle from "@/models/Puzzle";
import PlayerProgress from "@/models/PlayerProgress";
import { validateCell, getConflicts } from "@/lib/sudoku";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const { roomCode } = await params;
    const body = await request.json();
    const { row, col, value } = body;

    if (
      typeof row !== "number" ||
      typeof col !== "number" ||
      typeof value !== "number" ||
      row < 0 ||
      row > 8 ||
      col < 0 ||
      col > 8 ||
      value < 1 ||
      value > 9
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectDB();

    const player = await Player.findOne({ sessionId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const room = await Room.findOne({ code: roomCode.toUpperCase() });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.puzzleId) {
      return NextResponse.json({ error: "Game not started" }, { status: 400 });
    }

    const puzzle = await Puzzle.findById(room.puzzleId);
    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    const isCorrect = validateCell(puzzle.solution, row, col, value);

    if (!isCorrect) {
      await PlayerProgress.findOneAndUpdate(
        { roomId: room._id, playerId: player._id },
        { $inc: { mistakesCount: 1 } }
      );
    }

    const progress = await PlayerProgress.findOne({
      roomId: room._id,
      playerId: player._id,
    });

    const conflicts = isCorrect
      ? []
      : getConflicts(progress?.currentBoard || "", row, col, value);

    return NextResponse.json({
      isCorrect,
      conflicts,
    });
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
