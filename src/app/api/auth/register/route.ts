import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  hashPassword,
  setSessionCookie,
  validateEmail,
  validatePassword,
  validateDisplayName,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    // Validation
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    if (!validateDisplayName(displayName)) {
      return NextResponse.json(
        { success: false, error: "Tên hiển thị phải từ 2-20 ký tự" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email đã được sử dụng" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName: displayName.trim(),
    });

    // Set session cookie
    await setSessionCookie(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          displayName: user.displayName,
          points: user.points,
          stats: user.stats,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
