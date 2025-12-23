import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CaroRoom from "@/models/CaroRoom";
import { checkWinner, isValidMove, isBoardFull } from "@/lib/caro";

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { visitorId, row, col } = await request.json();

    if (visitorId === undefined || row === undefined || col === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const player = room.players.find((p: { visitorId: string; symbol: "X" | "O" | null }) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (player.symbol !== room.currentTurn) {
      return NextResponse.json(
        { error: "Not your turn" },
        { status: 400 }
      );
    }

    if (!isValidMove(room.board, row, col)) {
      return NextResponse.json(
        { error: "Invalid move" },
        { status: 400 }
      );
    }

    // Check if turn timeout (5 minutes = 300000ms)
    const TURN_TIMEOUT = 5 * 60 * 1000;
    if (room.turnStartedAt) {
      const elapsed = Date.now() - room.turnStartedAt.getTime();
      if (elapsed > TURN_TIMEOUT) {
        // Current player loses due to timeout
        const opponent = room.players.find((p: { visitorId: string }) => p.visitorId !== visitorId);
        room.status = "finished";
        room.winnerId = opponent?.visitorId || null;
        room.finishedAt = new Date();
        await room.save();

        return NextResponse.json({
          success: false,
          error: "Turn timeout",
          timeout: true,
          status: room.status,
          winnerId: room.winnerId,
        }, { status: 400 });
      }
    }

    room.board[row][col] = player.symbol;
    room.moves.push({
      row,
      col,
      symbol: player.symbol,
      timestamp: new Date(),
    });

    const hasWon = checkWinner(room.board, row, col, player.symbol);
    const isDraw = !hasWon && isBoardFull(room.board);

    if (hasWon) {
      room.status = "finished";
      room.winnerId = visitorId;
      room.finishedAt = new Date();
    } else if (isDraw) {
      room.status = "finished";
      room.winnerId = null;
      room.finishedAt = new Date();
    } else {
      room.currentTurn = room.currentTurn === "X" ? "O" : "X";
      room.turnStartedAt = new Date();
    }

    await room.save();

    return NextResponse.json({
      success: true,
      board: room.board,
      currentTurn: room.currentTurn,
      status: room.status,
      winnerId: room.winnerId,
      hasWon,
      isDraw,
    });
  } catch (error) {
    console.error("Failed to make move:", error);
    return NextResponse.json(
      { error: "Failed to make move" },
      { status: 500 }
    );
  }
}
