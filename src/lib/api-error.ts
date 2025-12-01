import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return NextResponse.json(
        { error: "Database error" },
        { status: 503 }
      );
    }
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function notFound(message = "Not found"): ApiError {
  return new ApiError(404, message, "NOT_FOUND");
}

export function unauthorized(message = "Unauthorized"): ApiError {
  return new ApiError(401, message, "UNAUTHORIZED");
}

export function badRequest(message = "Bad request"): ApiError {
  return new ApiError(400, message, "BAD_REQUEST");
}

export function forbidden(message = "Forbidden"): ApiError {
  return new ApiError(403, message, "FORBIDDEN");
}
