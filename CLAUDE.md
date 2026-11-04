# sudoku Development Guidelines

## Active Technologies

Next.js 16, React 19, TypeScript 5, Socket.IO, Tailwind CSS, Framer Motion, SQLite (`node:sqlite`, Node >= 22.5).

## Project Structure

```text
server.ts      custom server: Next + Socket.IO, giới hạn request /api
src/app/       trang và API route
src/server/    xử lý sự kiện Socket.IO
src/models/    truy cập SQLite (đồng bộ)
src/lib/       logic dùng chung
```

## Commands

npm test && npm run lint

## Rules

- Không có `await` giữa lúc đọc phòng và `save()`: đó là cách chống mất dữ liệu.
- Không gửi lời giải Sudoku của ván đối kháng cho client; server kiểm tra bài bằng `isSolutionOf`.
- Người chơi là khách, xác thực bằng token ký từ server (`src/lib/player-token.ts`).

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
