import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { visitorId } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { error: "Missing visitorId" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await CaroRoom.findOne({ code });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in progress" },
        { status: 400 }
      );
    }

    const opponent = room.players.find((p: { visitorId: string }) => p.visitorId !== visitorId);

    if (opponent) {
      room.winnerId = opponent.visitorId;
    }

    room.status = "finished";
    room.finishedAt = new Date();
    room.lastActivityAt = new Date();

    await room.save();

    return NextResponse.json({
      success: true,
      winnerId: room.winnerId,
    });
  } catch (error) {
    console.error("Failed to give up:", error);
    return NextResponse.json(
      { error: "Failed to give up" },
      { status: 500 }
    );
  }
}
