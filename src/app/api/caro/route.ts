import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";
import { v4 as uuidv4 } from "uuid";
import { createEmptyBoard } from "@/lib/caro";

export async function POST(request: NextRequest) {
  try {
    const { visitorId, name } = await request.json();

    if (!visitorId || !name) {
      return NextResponse.json(
        { error: "Missing visitorId or name" },
        { status: 400 }
      );
    }

    await connectDB();

    const code = uuidv4().slice(0, 8).toUpperCase();

    const room = await CaroRoom.create({
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
      lastActivityAt: new Date(),
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const rooms = await CaroRoom.find({
      status: { $in: ["waiting", "playing"] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      rooms: rooms.map((room) => ({
        code: room.code,
        status: room.status,
        playerCount: room.players.length,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch caro rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
