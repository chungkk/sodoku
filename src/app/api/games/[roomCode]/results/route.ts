import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import PlayerProgress from "@/models/PlayerProgress";
import Player from "@/models/Player";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const room = await Room.findOne({ code: roomCode.toUpperCase() });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const allProgress = await PlayerProgress.find({
      roomId: room._id,
    }).sort({ completionTime: 1 });

    const playerIds = allProgress.map((p) => p.playerId);
    const players = await Player.find({ _id: { $in: playerIds } });
    const playerMap = new Map(players.map((p) => [p._id.toString(), p]));

    const results = allProgress.map((progress, index) => {
      const player = playerMap.get(progress.playerId.toString());
      return {
        playerId: progress.playerId.toString(),
        sessionId: player?.sessionId || "",
        displayName: player?.displayName || "Unknown",
        status: progress.status,
        completionTime: progress.completionTime,
        mistakesCount: progress.mistakesCount,
        rank: progress.status === "completed" ? index + 1 : null,
      };
    });

    results.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return -1;
      if (a.status !== "completed" && b.status === "completed") return 1;
      if (a.status === "completed" && b.status === "completed") {
        return (a.completionTime || 0) - (b.completionTime || 0);
      }
      return 0;
    });

    let rank = 1;
    results.forEach((r) => {
      if (r.status === "completed") {
        r.rank = rank++;
      }
    });

    const allFinished = allProgress.every(
      (p) => p.status === "completed" || p.status === "gave_up"
    );

    return NextResponse.json({
      results,
      allFinished,
      gameStatus: room.status,
      difficulty: room.settings.difficulty,
    });
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
