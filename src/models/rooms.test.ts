import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { after, test } from "node:test";
// Phải đứng trước mọi import dùng DB
import { testDbDir } from "./test-db";
import CaroRoom from "./CaroRoom";
import Room from "./Room";
import { createEmptyBoard, MAX_PAUSE_MS_PER_PLAYER, TURN_TIMEOUT_MS } from "../lib/caro";
import { getDb } from "../lib/db";

after(() => {
  getDb().close();
  rmSync(testDbDir, { recursive: true, force: true });
});

function playingSudokuRoom() {
  const room = Room.createRoom("a", "Alice", "easy");
  room.addPlayer("b", "Bobby");
  room.status = "playing";
  room.startedAt = new Date();
  room.save();
  return room;
}

function playingCaroRoom(code: string, turnStartedAt: Date) {
  const room = CaroRoom.create({
    code,
    players: [
      { visitorId: "x", name: "X", symbol: "X", isReady: true, isConnected: true },
      { visitorId: "o", name: "O", symbol: "O", isReady: true, isConnected: true },
    ],
    board: createEmptyBoard(),
    currentTurn: "X",
    status: "waiting",
  });
  room.status = "playing";
  room.startedAt = turnStartedAt;
  room.turnStartedAt = turnStartedAt;
  room.save();
  return room;
}

test("bỏ cuộc rồi đối thủ giải xong thì đối thủ thắng", () => {
  const room = playingSudokuRoom();
  assert.equal(room.giveUp("a"), true);
  assert.equal(room.status, "playing");

  const solver = room.players.find((p) => p.visitorId === "b")!;
  solver.progress = 100;
  solver.finishedAt = new Date();
  room.finishIfAllDone();

  assert.equal(room.status, "finished");
  assert.equal(room.winnerId, "b");
});

test("người đã giải xong không thể bị xử bỏ cuộc", () => {
  const room = playingSudokuRoom();
  const solver = room.players.find((p) => p.visitorId === "a")!;
  solver.progress = 100;
  solver.finishedAt = new Date();

  assert.equal(room.giveUp("a"), false);
  assert.equal(solver.progress, 100);
});

test("phòng rời bỏ giữa chừng kết thúc khi người cuối bị xử thua, người đã giải vẫn thắng", () => {
  const room = playingSudokuRoom();
  const solver = room.players.find((p) => p.visitorId === "a")!;
  solver.progress = 100;
  solver.finishedAt = new Date();
  room.giveUp("b");

  assert.equal(room.status, "finished");
  assert.equal(room.winnerId, "a");
});

test("thời gian tạm dừng không bị tính vào lượt", () => {
  const start = new Date(1_000_000);
  const room = playingCaroRoom("PAUSE1", start);

  assert.equal(room.pause("x", new Date(start.getTime() + 60_000)), true);
  room.resume(new Date(start.getTime() + 120_000));

  assert.equal(room.turnStartedAt!.getTime(), start.getTime() + 60_000);
  assert.equal(room.nextTimerDelayMs(new Date(start.getTime() + 120_000)), TURN_TIMEOUT_MS - 60_000);
});

test("trạng thái tạm dừng được lưu qua lần đọc lại từ DB", () => {
  const start = new Date(2_000_000);
  const room = playingCaroRoom("PAUSE2", start);
  room.pause("x", start);
  room.save();

  const reloaded = CaroRoom.findByCode("PAUSE2")!;
  assert.equal(reloaded.pausedBy, "x");
  assert.equal(reloaded.nextTimerDelayMs(start), MAX_PAUSE_MS_PER_PLAYER);
});

test("không thể tạm dừng vô hạn: dùng hết quỹ thì không được dừng nữa", () => {
  const start = new Date(3_000_000);
  const room = playingCaroRoom("PAUSE3", start);

  assert.equal(room.pause("x", start), true);
  assert.equal(room.pause("o", start), false, "đang dừng thì người khác không dừng chồng được");
  room.resume(new Date(start.getTime() + MAX_PAUSE_MS_PER_PLAYER));

  assert.equal(room.pause("x", new Date(start.getTime() + MAX_PAUSE_MS_PER_PLAYER)), false);
  assert.equal(room.pause("o", new Date(start.getTime() + MAX_PAUSE_MS_PER_PLAYER)), true);
});

test("gọi lại nhiều lần không kéo dài được đồng hồ lượt", () => {
  const start = new Date(4_000_000);
  const room = playingCaroRoom("TIMER1", start);
  const later = new Date(start.getTime() + 100_000);

  assert.equal(room.nextTimerDelayMs(later), TURN_TIMEOUT_MS - 100_000);
  assert.equal(room.nextTimerDelayMs(later), TURN_TIMEOUT_MS - 100_000);
  assert.equal(room.nextTimerDelayMs(new Date(start.getTime() + TURN_TIMEOUT_MS * 2)), 0);
});

test("findPlaying trả về đúng phòng đang chơi của cả hai game", () => {
  const sudoku = playingSudokuRoom();
  playingCaroRoom("LIVE01", new Date());
  assert.ok(Room.findPlaying().some((r) => r.code === sudoku.code));
  assert.ok(CaroRoom.findPlaying().some((r) => r.code === "LIVE01"));
});

test("phòng Caro quá 24 giờ bị dọn khi tạo phòng mới, phòng còn hạn được giữ", () => {
  const stale = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  playingCaroRoom("KEEP01", new Date());
  playingCaroRoom("OLD001", new Date());
  getDb().prepare("UPDATE caro_rooms SET created_at = ? WHERE code = 'OLD001'").run(stale);

  playingCaroRoom("NEW001", new Date());

  assert.equal(CaroRoom.findByCode("OLD001"), null);
  assert.ok(CaroRoom.findByCode("KEEP01"));
});
