import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";

export async function GET() {
  try {
    await connectDB();

    const rooms = await CaroRoom.find({
      status: "waiting",
      "players.1": { $exists: false }, // chi lay phong co 1 nguoi (cho doi)
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // trong 1 gio
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(
      rooms.map((room) => ({
        code: room.code,
        playerCount: room.players.length,
        hostName: room.players[0]?.name || "Unknown",
        createdAt: room.createdAt,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch recent caro rooms:", error);
    return NextResponse.json([]);
  }
}
