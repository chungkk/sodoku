import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Player from "@/models/Player";
import PlayerProgress from "@/models/PlayerProgress";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
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

    return NextResponse.json({
      currentBoard: progress.currentBoard,
      mistakesCount: progress.mistakesCount,
      status: progress.status,
      completionTime: progress.completionTime,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionId = request.headers.get("X-Session-ID");

    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const { roomCode } = await params;
    const body = await request.json();
    const { currentBoard } = body;

    if (!currentBoard || !/^[0-9]{81}$/.test(currentBoard)) {
      return NextResponse.json(
        { error: "Invalid board format" },
        { status: 400 }
      );
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

    const progress = await PlayerProgress.findOneAndUpdate(
      { roomId: room._id, playerId: player._id },
      { currentBoard },
      { new: true }
    );

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
