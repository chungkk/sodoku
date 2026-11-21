import { NextRequest, NextResponse } from "next/server";
import CaroRoom from "@/models/CaroRoom";
import { v4 as uuidv4 } from "uuid";
import { createEmptyBoard } from "@/lib/caro";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { cleanPlayerName } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { visitorId, name: rawName } = await request.json();
    const name = cleanPlayerName(rawName);

    if (!visitorId || !name) {
      return NextResponse.json(
        { error: "Missing visitorId or invalid name" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    let code = uuidv4().slice(0, 6).toUpperCase();
    while (CaroRoom.findByCode(code)) {
      code = uuidv4().slice(0, 6).toUpperCase();
    }

    const room = CaroRoom.create({
      code,
      players: [
        {
          visitorId,
          name,
          symbol: "X",
          isReady: false,
          isConnected: true,
        },
      ],
      board: createEmptyBoard(),
      currentTurn: "X",
      status: "waiting",
    });

    return NextResponse.json({
      success: true,
      room: {
        code: room.code,
        status: room.status,
        players: room.players,
      },
    });
  } catch (error) {
    console.error("Failed to create caro room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
