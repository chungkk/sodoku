import { NextResponse } from "next/server";
import Room from "@/models/Room";

// Danh sách đổi liên tục: không để Next dựng tĩnh lúc build
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rooms = Room.findOpen(new Date(Date.now() - 60 * 60 * 1000), 10);

    return NextResponse.json(
      rooms.map((room) => ({
        code: room.code,
        playerCount: room.players.length,
        hostName: room.players[0]?.name || "Unknown",
        createdAt: room.createdAt,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch recent rooms:", error);
    return NextResponse.json([]);
  }
}
