import { createServer } from "http";
import { parse } from "url";
import next from "next";
import type { IncomingMessage, ServerResponse } from "http";
import { Server as SocketIOServer } from "socket.io";
import { RateLimiter } from "./src/lib/rate-limit";
import { setupSocketHandlers } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const MAX_API_BODY_BYTES = 64 * 1024;
// Ngưỡng rộng vì nhiều người có thể chung một IP (NAT, wifi); mỗi người chơi gửi khoảng 1 request/giây
const apiLimiter = new RateLimiter(1200, 60 * 1000);
const createLimiter = new RateLimiter(60, 60 * 1000);
const CREATE_PATHS = new Set(["/api/player/session", "/api/rooms", "/api/caro"]);

/** Chỉ tin X-Forwarded-For khi request đi qua reverse proxy nội bộ (Coolify/Traefik/Docker/localhost). */
function isPrivateProxy(addr: string | undefined): boolean {
  if (!addr) return false;
  const ip = addr.startsWith("::ffff:") ? addr.slice(7) : addr;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

/** Proxy (Traefik của Coolify) nối IP vừa kết nối vào cuối X-Forwarded-For; các giá trị đứng trước do client tự khai. */
function clientIp(req: IncomingMessage): string {
  const remote = req.socket.remoteAddress;
  if (isPrivateProxy(remote)) {
    const forwarded = req.headers["x-forwarded-for"];
    const last = (Array.isArray(forwarded) ? forwarded.join(",") : forwarded)?.split(",").pop()?.trim();
    if (last) return last;
  }
  return remote || "unknown";
}

function reject(res: ServerResponse, status: number, error: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error }));
}

/** Chặn request /api quá lớn hoặc quá dày. Trả về true nếu đã trả lời luôn. */
function guardApi(req: IncomingMessage, res: ServerResponse, pathname: string | null): boolean {
  if (!pathname?.startsWith("/api/")) return false;

  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    // Chunked hoặc thiếu Content-Length không kiểm tra trước được kích thước; trình duyệt gửi JSON luôn có Content-Length
    const rawLength = req.headers["content-length"];
    const length = rawLength !== undefined ? Number(rawLength) : NaN;
    if (req.headers["transfer-encoding"] || !Number.isFinite(length) || length < 0) {
      reject(res, 411, "Content-Length required");
      return true;
    }
    if (length > MAX_API_BODY_BYTES) {
      reject(res, 413, "Request body too large");
      return true;
    }
  }

  const ip = clientIp(req);
  const creating = req.method === "POST" && CREATE_PATHS.has(pathname);
  if (!apiLimiter.allow(ip) || (creating && !createLimiter.allow(ip))) {
    reject(res, 429, "Too many requests");
    return true;
  }
  return false;
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      if (guardApi(req, res, parsedUrl.pathname)) return;
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const configuredOrigin = (dev ? `http://localhost:${port}` : process.env.NEXTAUTH_URL)?.replace(/\/+$/, "");

  const isAllowedOrigin = (origin: string | undefined, host: string | undefined): boolean => {
    if (!origin) return true;
    const normalized = origin.replace(/\/+$/, "");
    if (configuredOrigin && normalized === configuredOrigin) return true;
    if (host && (normalized === `http://${host}` || normalized === `https://${host}`)) return true;
    return false;
  };

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    maxHttpBufferSize: MAX_API_BODY_BYTES,
    cors: {
      origin: configuredOrigin || false,
      methods: ["GET", "POST"],
      credentials: true,
    },
    allowRequest: (req, callback) => {
      if (!isAllowedOrigin(req.headers.origin, req.headers.host)) {
        return callback("Origin not allowed", false);
      }
      callback(null, true);
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  setupSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(
      `> Ready on http://${hostname}:${port} as ${dev ? "development" : process.env.NODE_ENV}`
    );
    console.log("> Socket.io server running on /api/socketio");
  });

  const shutdown = (signal: string) => {
    console.log(`> Received ${signal}, shutting down gracefully...`);
    io.close(() => {
      httpServer.close(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
});
