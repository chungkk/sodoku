import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("gameHistory");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const games = (user.gameHistory || []).map((g) => ({
      date: g.date.toISOString(),
      mode: g.mode,
      difficulty: g.difficulty,
      time: g.time,
      errors: g.errors,
      won: g.result === "won" || g.result === "completed",
    }));

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Failed to get history" },
      { status: 500 }
    );
  }
}
