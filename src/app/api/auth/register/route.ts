import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, isValidEmail, isValidPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, email, password } = body;

    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { error: "Display name must be between 2 and 20 characters" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      displayName: trimmedName,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
