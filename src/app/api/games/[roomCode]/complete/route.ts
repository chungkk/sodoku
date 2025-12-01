import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";
import PlayerProgress from "@/models/PlayerProgress";
import Puzzle from "@/models/Puzzle";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionId = request.headers.get("X-Session-ID");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 401 }
      );
    }

    const { roomCode } = await params;

    await connectDB();

    const player = await Player.findOne({ sessionId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const room = await Room.findOne({ code: roomCode.toUpperCase() });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in progress" },
        { status: 400 }
      );
    }

    const progress = await PlayerProgress.findOne({
      roomId: room._id,
      playerId: player._id,
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    if (progress.status === "completed") {
      return NextResponse.json(
        { error: "Already completed" },
        { status: 400 }
      );
    }

    const puzzle = await Puzzle.findById(room.puzzleId);
    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    if (progress.currentBoard !== puzzle.solution) {
      return NextResponse.json(
        { error: "Puzzle not correctly solved" },
        { status: 400 }
      );
    }

    const completionTime = room.gameStartedAt 
      ? Date.now() - room.gameStartedAt.getTime() 
      : 0;

    progress.status = "completed";
    progress.completionTime = completionTime;
    progress.completedAt = new Date();
    await progress.save();

    const allProgress = await PlayerProgress.find({
      roomId: room._id,
    });

    const completedCount = allProgress.filter(
      (p) => p.status === "completed" || p.status === "gave_up"
    ).length;

    const allFinished = completedCount === room.players.length;

    if (allFinished) {
      room.status = "finished";
      await room.save();
    }

    return NextResponse.json({
      success: true,
      completionTime,
      rank: allProgress.filter(
        (p) => p.status === "completed" && p.completionTime && p.completionTime < completionTime
      ).length + 1,
      allFinished,
    });
  } catch (error) {
    console.error("Complete game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
