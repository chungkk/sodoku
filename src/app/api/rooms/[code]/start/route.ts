import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";
import Puzzle from "@/models/Puzzle";
import PlayerProgress from "@/models/PlayerProgress";
import { generatePuzzle } from "@/lib/sudoku";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const { code } = await params;

    await connectDB();

    const player = await Player.findOne({ sessionId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const room = await Room.findOne({ code: code.toUpperCase() }).populate("players");
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostPlayerId.toString() !== player._id.toString()) {
      return NextResponse.json({ error: "Only host can start" }, { status: 403 });
    }

    if (room.players.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 players" },
        { status: 400 }
      );
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 400 }
      );
    }

    const puzzleData = generatePuzzle(room.settings.difficulty);
    const puzzle = await Puzzle.create(puzzleData);

    room.puzzleId = puzzle._id;
    room.status = "playing";
    room.gameStartedAt = new Date();
    await room.save();

    const progressPromises = room.players.map((p: any) =>
      PlayerProgress.create({
        roomId: room._id,
        playerId: p._id,
        currentBoard: puzzle.initialBoard,
        mistakesCount: 0,
        status: "playing",
      })
    );
    await Promise.all(progressPromises);

    return NextResponse.json({
      puzzle: puzzle.initialBoard,
      startTime: room.gameStartedAt.getTime(),
      difficulty: puzzle.difficulty,
    });
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
