import { NextRequest, NextResponse } from "next/server";
import CaroRoom from "@/models/CaroRoom";
import { createEmptyBoard } from "@/lib/caro";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { cleanPlayerName, generateRoomCode, readJsonObject } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { visitorId, name: rawName } = body;
    const name = cleanPlayerName(rawName);

    if (typeof visitorId !== "string" || !visitorId || !name) {
      return NextResponse.json(
        { error: "Missing visitorId or invalid name" },
        { status: 400 }
      );
    }

    const denied = denyUnlessPlayer(request, visitorId);
    if (denied) return denied;

    let code = generateRoomCode();
    while (CaroRoom.findByCode(code)) {
      code = generateRoomCode();
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
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
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
