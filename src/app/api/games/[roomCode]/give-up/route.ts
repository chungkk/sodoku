import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

interface RouteParams {
  params: Promise<{ roomCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { roomCode } = await params;
    const body = await request.json();
    const { visitorId } = body;

    if (!roomCode || !visitorId) {
      return NextResponse.json(
        { error: "roomCode and visitorId are required" },
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

    player.progress = -1;
    player.finishedAt = new Date();

    const activePlayers = room.players.filter((p) => p.progress !== -1 && !p.finishedAt);

    if (activePlayers.length === 0) {
      room.status = "finished";
      room.finishedAt = new Date();

      const finishedPlayers = room.players.filter((p) => p.progress === 100 && p.finishedAt);
      if (finishedPlayers.length > 0) {
        const startTime = room.startedAt!.getTime();
        finishedPlayers.sort((a, b) => {
          const timeA = a.finishedAt!.getTime() - startTime;
          const timeB = b.finishedAt!.getTime() - startTime;
          if (timeA !== timeB) return timeA - timeB;
          return (a.errors || 0) - (b.errors || 0);
        });
        room.winnerId = finishedPlayers[0].visitorId;
      }
    }

    await room.save();

    return NextResponse.json({
      success: true,
      gameEnded: room.status === "finished",
      winnerId: room.winnerId,
    });
  } catch (error) {
    console.error("Give up error:", error);
    return NextResponse.json(
      { error: "Failed to give up" },
      { status: 500 }
    );
  }
}
