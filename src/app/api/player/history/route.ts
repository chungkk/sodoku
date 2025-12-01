import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Player from "@/models/Player";
import { GameHistory, IPlayerResult } from "@/models/GameHistory";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    await connectDB();

    const player = await Player.findOne({ sessionId });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const games = await GameHistory.find({
      "players.playerId": player._id.toString(),
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const totalCount = await GameHistory.countDocuments({
      "players.playerId": player._id.toString(),
    });

    const history = games.map((game) => {
      const playerResult = game.players.find(
        (p: IPlayerResult) => p.playerId === player._id.toString()
      );
      return {
        id: game._id.toString(),
        roomCode: game.roomCode,
        difficulty: game.difficulty,
        playedAt: game.createdAt,
        status: playerResult?.status || "unknown",
        completionTime: playerResult?.completionTime || null,
        rank: playerResult?.rank || null,
        totalPlayers: game.players.length,
        mistakesCount: playerResult?.mistakesCount || 0,
      };
    });

    const completedGames = history.filter((g) => g.status === "completed");
    const wins = history.filter((g) => g.rank === 1).length;
    const avgTime =
      completedGames.length > 0
        ? completedGames.reduce((sum, g) => sum + (g.completionTime || 0), 0) /
          completedGames.length
        : 0;
    const bestTime =
      completedGames.length > 0
        ? Math.min(...completedGames.map((g) => g.completionTime || Infinity))
        : 0;

    return NextResponse.json({
      history,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      stats: {
        gamesPlayed: totalCount,
        gamesWon: wins,
        gamesCompleted: completedGames.length,
        averageTime: Math.round(avgTime),
        bestTime: bestTime === Infinity ? 0 : bestTime,
      },
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
