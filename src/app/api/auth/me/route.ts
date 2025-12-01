import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
