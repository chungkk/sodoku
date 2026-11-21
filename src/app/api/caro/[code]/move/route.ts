import { NextRequest, NextResponse } from "next/server";
import CaroRoom from "@/models/CaroRoom";
import { checkWinner, isValidMove, isBoardFull, TURN_TIMEOUT_MS } from "@/lib/caro";
import { denyUnlessPlayer } from "@/lib/player-auth";
import { broadcast, caroSocketRoom, caroTurnEnded, caroTurnStarted } from "@/lib/realtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { visitorId, row, col } = await request.json();

    if (visitorId === undefined || row === undefined || col === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    if (room.pausedBy) {
      return NextResponse.json({ error: "Game is paused" }, { status: 400 });
    }

    const player = room.players.find((p) => p.visitorId === visitorId);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (player.symbol !== room.currentTurn) {
      return NextResponse.json(
        { error: "Not your turn" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(row) || !Number.isInteger(col) || !isValidMove(room.board, row, col)) {
      return NextResponse.json(
        { error: "Invalid move" },
        { status: 400 }
      );
    }

    // Mốc đầu lượt đã được lùi theo thời gian tạm dừng, nên lúc dừng không bị tính vào đây
    if (room.turnStartedAt) {
      const elapsed = Date.now() - room.turnStartedAt.getTime();
      if (elapsed > TURN_TIMEOUT_MS) {
        // Current player loses due to timeout
        const opponent = room.players.find((p) => p.visitorId !== visitorId);
        room.status = "finished";
        room.winnerId = opponent?.visitorId || null;
        room.finishedAt = new Date();
        room.save();

        caroTurnEnded(room.code);
        broadcast(caroSocketRoom(room.code), "caro_turn_timeout", {
          timedOutPlayer: visitorId,
          winnerId: room.winnerId,
        });
        broadcast(caroSocketRoom(room.code), "caro_game_ended", {
          winnerId: room.winnerId,
          isDraw: false,
          reason: "timeout",
        });

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

    room.save();

    const socketRoom = caroSocketRoom(room.code);
    broadcast(socketRoom, "caro_move_made", {
      visitorId,
      row,
      col,
      symbol: player.symbol,
      board: room.board,
      currentTurn: room.currentTurn,
      turnStartedAt: room.turnStartedAt,
    });
    if (room.status === "finished") {
      caroTurnEnded(room.code);
      broadcast(socketRoom, "caro_game_ended", { winnerId: room.winnerId, isDraw });
    } else {
      caroTurnStarted(room.code);
    }

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
