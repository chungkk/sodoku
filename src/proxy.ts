import { NextResponse, type NextRequest } from "next/server";

/**
 * Sinh CSP nonce riêng cho từng request (loại bỏ 'unsafe-inline' khỏi script-src).
 * Next.js 16 tự đọc nonce từ header Content-Security-Policy của request để gắn vào script hydrate.
 */
export function proxy(request: NextRequest) {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = Buffer.from(bytes).toString("base64");
  const isProd = process.env.NODE_ENV === "production";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProd ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Chạy cho mọi trang HTML; bỏ qua asset tĩnh, ảnh và endpoint Socket.IO
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|mascot.svg|api/socketio).*)",
  ],
};
