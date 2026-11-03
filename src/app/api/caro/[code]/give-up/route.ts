import { NextRequest, NextResponse } from "next/server";
import CaroRoom from "@/models/CaroRoom";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { broadcast, caroSocketRoom, caroTurnEnded } from "@/lib/realtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { visitorId } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { error: "Missing visitorId" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    const room = CaroRoom.findByCode(code);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in progress" },
        { status: 400 }
      );
    }

    const player = room.players.find((p) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json({ error: "Player not in room" }, { status: 403 });
    }

    const opponent = room.players.find((p) => p.visitorId !== visitorId);
    room.winnerId = opponent?.visitorId ?? null;
    room.status = "finished";
    room.finishedAt = new Date();
    room.save();

    const socketRoom = caroSocketRoom(room.code);
    caroTurnEnded(room.code);
    broadcast(socketRoom, "caro_player_gave_up", { visitorId, name: player.name });
    broadcast(socketRoom, "caro_game_ended", { winnerId: room.winnerId, isDraw: false });

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
