import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Puzzle from "@/models/Puzzle";
import { isPuzzleComplete } from "@/lib/sudoku";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId, grid, time } = body;

    if (!roomCode || !visitorId || !grid) {
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

    if (player.finishedAt) {
      return NextResponse.json(
        { error: "Player already finished" },
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

    const isComplete = isPuzzleComplete(grid, puzzle.solution);

    if (!isComplete) {
      return NextResponse.json({
        success: false,
        message: "Puzzle is not complete or has errors",
      });
    }

    player.finishedAt = new Date();
    player.progress = 100;
    player.currentGrid = grid;

    const allFinished = room.players.every((p) => p.finishedAt !== null);

    if (allFinished) {
      room.status = "finished";
      room.finishedAt = new Date();

      const rankings = [...room.players]
        .filter((p) => p.finishedAt)
        .sort((a, b) => {
          const timeA = a.finishedAt!.getTime() - room.startedAt!.getTime();
          const timeB = b.finishedAt!.getTime() - room.startedAt!.getTime();
          if (timeA !== timeB) return timeA - timeB;
          return (a.errors || 0) - (b.errors || 0);
        });

      if (rankings.length > 0) {
        room.winnerId = rankings[0].visitorId;
      }
    }

    await room.save();

    return NextResponse.json({
      success: true,
      finished: true,
      time: time || (player.finishedAt.getTime() - room.startedAt!.getTime()) / 1000,
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
