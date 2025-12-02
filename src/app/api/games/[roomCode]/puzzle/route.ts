import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Puzzle from "@/models/Puzzle";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;

    if (!roomCode || roomCode.length !== 6) {
      return NextResponse.json(
        { error: "Invalid room code" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: roomCode.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    if (!room.puzzleId) {
      return NextResponse.json(
        { error: "Game not started yet" },
        { status: 400 }
      );
    }

    const puzzle = await Puzzle.findById(room.puzzleId);

    if (!puzzle) {
      return NextResponse.json(
        { error: "Puzzle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      puzzle: puzzle.grid,
      solution: puzzle.solution,
      difficulty: room.difficulty,
      startedAt: room.startedAt,
    });
  } catch (error) {
    console.error("Get puzzle error:", error);
    return NextResponse.json(
      { error: "Failed to get puzzle" },
      { status: 500 }
    );
  }
}
