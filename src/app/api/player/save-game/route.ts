import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated", saved: false },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { mode, difficulty, time, errors, result, roomCode } = body;

    if (!mode || !difficulty || time === undefined || !result) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await user.addGameRecord({
      mode,
      difficulty,
      time,
      errors: errors || 0,
      result,
      roomCode,
    });

    return NextResponse.json({
      success: true,
      saved: true,
      stats: user.stats,
    });
  } catch (error) {
    console.error("Save game error:", error);
    return NextResponse.json(
      { error: "Failed to save game" },
      { status: 500 }
    );
  }
}
