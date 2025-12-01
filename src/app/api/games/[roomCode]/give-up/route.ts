import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";
import PlayerProgress from "@/models/PlayerProgress";

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

    if (progress.status !== "playing") {
      return NextResponse.json(
        { error: "Already finished" },
        { status: 400 }
      );
    }

    progress.status = "gave_up";
    progress.completedAt = new Date();
    await progress.save();

    const allProgress = await PlayerProgress.find({
      roomId: room._id,
    });

    const finishedCount = allProgress.filter(
      (p) => p.status === "completed" || p.status === "gave_up"
    ).length;

    const allFinished = finishedCount === room.players.length;

    if (allFinished) {
      room.status = "finished";
      await room.save();
    }

    return NextResponse.json({
      success: true,
      allFinished,
    });
  } catch (error) {
    console.error("Give up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
