import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Player from "@/models/Player";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    await connectDB();

    const player = await Player.findOne({ sessionId });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: player._id.toString(),
      displayName: player.displayName,
      isGuest: player.isGuest,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        averageTime: 0,
        bestTime: 0,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || displayName.length < 2 || displayName.length > 20) {
      return NextResponse.json(
        { error: "Display name must be 2-20 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const player = await Player.findOneAndUpdate(
      { sessionId },
      { displayName, lastActiveAt: new Date() },
      { new: true }
    );

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
