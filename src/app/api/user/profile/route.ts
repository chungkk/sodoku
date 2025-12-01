import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { GameHistory } from "@/models/GameHistory";
import {
  getSessionUserId,
  hashPassword,
  validatePassword,
  validateDisplayName,
} from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 401 }
      );
    }

    // Calculate win rate
    const winRate =
      user.stats.totalGames > 0
        ? Math.round((user.stats.wins / user.stats.totalGames) * 100)
        : 0;

    // Get recent games
    const recentGames = await GameHistory.find({
      "players.playerId": userId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedGames = recentGames.map((game) => {
      const playerResult = game.players.find(
        (p: { playerId: string }) => p.playerId === userId
      );
      const isWinner = playerResult?.rank === 1;
      return {
        roomCode: game.roomCode,
        difficulty: game.difficulty,
        rank: playerResult?.rank || 0,
        completionTime: playerResult?.completionTime || null,
        status: playerResult?.status || "in_progress",
        pointsChange: isWinner ? 10 : -10,
        playedAt: game.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        points: user.points,
        stats: {
          wins: user.stats.wins,
          losses: user.stats.losses,
          totalGames: user.stats.totalGames,
          winRate,
        },
        recentGames: formattedGames,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, password } = body;

    // Validate if provided
    if (displayName !== undefined && !validateDisplayName(displayName)) {
      return NextResponse.json(
        { success: false, error: "Tên hiển thị phải từ 2-20 ký tự" },
        { status: 400 }
      );
    }

    if (password !== undefined && !validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: { displayName?: string; password?: string } = {};
    if (displayName) {
      updateData.displayName = displayName.trim();
    }
    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "Không có thông tin cập nhật" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        points: user.points,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
