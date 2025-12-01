import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Player from "@/models/Player";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, displayName } = body;

    if (!displayName || displayName.length < 2 || displayName.length > 20) {
      return NextResponse.json(
        { error: "Display name must be 2-20 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    let player = await Player.findOne({ sessionId });

    if (player) {
      player.displayName = displayName;
      player.lastActiveAt = new Date();
      player.connectionStatus = "connected";
      await player.save();
    } else {
      player = await Player.create({
        sessionId,
        displayName,
        isGuest: true,
        connectionStatus: "connected",
      });
    }

    return NextResponse.json({
      sessionId: player.sessionId,
      playerId: player._id.toString(),
      displayName: player.displayName,
      isGuest: player.isGuest,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
