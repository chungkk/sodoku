import assert from "node:assert/strict";
import { test } from "node:test";
import { pickWinnerId } from "./ranking";
import { RateLimiter } from "./rate-limit";
import { calculateFillProgress, generatePuzzle, isSolutionOf } from "./sudoku";
import { clientProgress, cleanPlayerName, isNotes, isNumberGrid, isPlayerGrid } from "./validation";

const player = (visitorId: string, progress: number, finishedAtMs: number | null, errors = 0) => ({
  visitorId,
  progress,
  errors,
  finishedAt: finishedAtMs === null ? null : new Date(finishedAtMs),
});

test("người bỏ cuộc sớm không thắng người giải xong sau", () => {
  assert.equal(pickWinnerId([player("quit", -1, 10), player("solver", 100, 300)]), "solver");
});

test("tất cả bỏ cuộc thì không có người thắng", () => {
  assert.equal(pickWinnerId([player("a", -1, 10), player("b", -1, 20)]), null);
});

test("người giải nhanh hơn thắng, hoà thời gian thì ít lỗi hơn thắng", () => {
  assert.equal(pickWinnerId([player("slow", 100, 20), player("fast", 100, 10)]), "fast");
  assert.equal(pickWinnerId([player("many", 100, 10, 3), player("few", 100, 10, 1)]), "few");
});

test("isSolutionOf chỉ nhận lời giải đúng và giữ nguyên ô đề bài", () => {
  const { grid, solution } = generatePuzzle("easy");
  assert.equal(isSolutionOf(solution, grid), true);

  const givens = grid.flatMap((row, r) => row.map((v, c) => [r, c, v])).filter(([, , v]) => v !== 0);
  const [r, c] = givens[0];
  const wrongCell = solution.map((row) => [...row]);
  wrongCell[r][c] = (wrongCell[r][c] % 9) + 1;
  assert.equal(isSolutionOf(wrongCell, grid), false);

  // Lời giải hợp lệ khác (đổi tên số 1 <-> 2) vẫn phải bị từ chối vì sai ô đề bài
  const relabeled = solution.map((row) => row.map((v) => (v === 1 ? 2 : v === 2 ? 1 : v)));
  assert.equal(isSolutionOf(relabeled, grid), false);
});

test("tiến độ đếm ô đã điền và chỉ đạt 100 khi giải đúng", () => {
  const { grid, solution } = generatePuzzle("easy");
  assert.equal(calculateFillProgress(grid, grid), 0);
  assert.equal(calculateFillProgress(solution, grid), 100);

  // Điền đủ nhưng còn sai thì dừng ở 99: đối thủ không thấy "đã xong" khi chưa giải đúng
  const wrong = solution.map((row) => [...row]);
  const empty = grid.flatMap((row, r) => row.map((v, c) => [r, c, v])).find(([, , v]) => v === 0)!;
  wrong[empty[0]][empty[1]] = (wrong[empty[0]][empty[1]] % 9) + 1;
  assert.equal(calculateFillProgress(wrong, grid), 99);
});

test("kiểm tra dữ liệu client gửi lên", () => {
  const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
  assert.equal(isNumberGrid(empty), true);
  assert.equal(isNumberGrid(empty.slice(1)), false);
  assert.equal(isNumberGrid(empty.map((row) => row.map(() => 1.5))), false);
  assert.equal(isNumberGrid(empty.map((row) => row.map(() => null))), false);
  assert.equal(isPlayerGrid(empty.map((row) => row.map(() => null))), true);
  assert.equal(isPlayerGrid(empty.map((row) => row.map(() => "x"))), false);
  assert.equal(isNotes([]), true);
  assert.equal(isNotes(empty.map((row) => row.map(() => [1, 2]))), true);
  assert.equal(isNotes(empty.map((row) => row.map(() => [0]))), false);
  assert.equal(clientProgress(100), 99);
  assert.equal(clientProgress(42.4), 42);
  assert.equal(clientProgress(-1), null);
  assert.equal(clientProgress("50"), null);
  assert.equal(cleanPlayerName("  An  "), "An");
  assert.equal(cleanPlayerName("x".repeat(21)), null);
  assert.equal(cleanPlayerName(5), null);
});

test("RateLimiter chặn khi vượt ngưỡng và mở lại ở cửa sổ mới", () => {
  let now = 0;
  const limiter = new RateLimiter(2, 1000, () => now);
  assert.deepEqual([limiter.allow("a"), limiter.allow("a"), limiter.allow("a")], [true, true, false]);
  assert.equal(limiter.allow("b"), true);
  now = 1000;
  assert.equal(limiter.allow("a"), true);
});
