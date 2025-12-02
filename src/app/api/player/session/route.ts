import { NextRequest, NextResponse } from "next/server";
import { generateVisitorId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { error: "Name must be between 2 and 20 characters" },
        { status: 400 }
      );
    }

    const visitorId = generateVisitorId();

    return NextResponse.json({
      visitorId,
      name: trimmedName,
      isGuest: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
