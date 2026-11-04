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

/** Proxy (Traefik của Coolify) nối IP vừa kết nối vào cuối X-Forwarded-For; các giá trị đứng trước do client tự khai. */
function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const last = (Array.isArray(forwarded) ? forwarded.join(",") : forwarded)?.split(",").pop()?.trim();
  return last || req.socket.remoteAddress || "unknown";
}

function reject(res: ServerResponse, status: number, error: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error }));
}

/** Chặn request /api quá lớn hoặc quá dày. Trả về true nếu đã trả lời luôn. */
function guardApi(req: IncomingMessage, res: ServerResponse, pathname: string | null): boolean {
  if (!pathname?.startsWith("/api/")) return false;

  if (req.method !== "GET" && req.method !== "HEAD") {
    // Chunked không báo trước kích thước nên không kiểm tra được; trình duyệt gửi JSON luôn có Content-Length
    if (req.headers["transfer-encoding"]) {
      reject(res, 411, "Content-Length required");
      return true;
    }
    if (Number(req.headers["content-length"] ?? 0) > MAX_API_BODY_BYTES) {
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

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    maxHttpBufferSize: MAX_API_BODY_BYTES,
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"],
      credentials: true,
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
});
