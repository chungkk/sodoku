import assert from "node:assert/strict";
import { test } from "node:test";
import { checkWinner, createEmptyBoard, findWinningCells, isBoardFull, isValidMove } from "./caro";
import { generateVisitorId, isValidPlayerToken, signPlayerToken } from "./player-token";
import { pickWinnerId } from "./ranking";
import { RateLimiter } from "./rate-limit";
import { calculateFillProgress, countWrongCells, generatePuzzle, isSolutionOf } from "./sudoku";
import {
  clientProgress,
  cleanPlayerName,
  generateRoomCode,
  isNotes,
  isNumberGrid,
  isPlayerGrid,
  isValidRoomCode,
  readJsonObject,
  uniquePlayerName,
} from "./validation";

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

test("tiến độ chỉ đếm ô đã điền không trùng luật và chỉ đạt 100 khi giải đúng", () => {
  const { grid, solution } = generatePuzzle("easy");
  assert.equal(calculateFillProgress(grid, grid), 0);
  assert.equal(calculateFillProgress(solution, grid), 100);

  // Điền số bị trùng luật Sudoku thì không được cộng tiến độ
  const empty = grid.flatMap((row, r) => row.map((v, c) => [r, c, v])).find(([, , v]) => v === 0)!;
  const rowGiven = grid[empty[0]].find((v) => v !== 0)!;
  const conflicted = grid.map((row) => [...row]);
  conflicted[empty[0]][empty[1]] = rowGiven;
  assert.equal(calculateFillProgress(conflicted, grid), 0);

  // Điền đủ nhưng còn sai thì không đạt 100 và trừ các ô bị trùng
  const wrong = solution.map((row) => [...row]);
  wrong[empty[0]][empty[1]] = (wrong[empty[0]][empty[1]] % 9) + 1;
  assert.ok(calculateFillProgress(wrong, grid) < 100);
});

test("countWrongCells chỉ đếm ô người chơi điền sai, bỏ qua ô trống và đề bài", () => {
  const { grid, solution } = generatePuzzle("easy");
  assert.equal(countWrongCells(grid, grid, solution), 0);
  assert.equal(countWrongCells(solution, grid, solution), 0);

  const empties = grid.flatMap((row, r) => row.map((v, c) => [r, c, v])).filter(([, , v]) => v === 0);
  const partial = grid.map((row) => [...row]);
  partial[empties[0][0]][empties[0][1]] = solution[empties[0][0]][empties[0][1]];
  partial[empties[1][0]][empties[1][1]] = (solution[empties[1][0]][empties[1][1]] % 9) + 1;
  partial[empties[2][0]][empties[2][1]] = (solution[empties[2][0]][empties[2][1]] % 9) + 1;
  assert.equal(countWrongCells(partial, grid, solution), 2);
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
  assert.equal(cleanPlayerName("A"), null);
  assert.equal(cleanPlayerName("x".repeat(21)), null);
  assert.equal(cleanPlayerName(5), null);
  assert.equal(uniquePlayerName("Alice", ["Bob"]), "Alice");
  assert.equal(uniquePlayerName("Alice", ["alice"]), "Alice (2)");
  assert.equal(uniquePlayerName("Alice", ["Alice", "Alice (2)"]), "Alice (3)");
  assert.ok(uniquePlayerName("A".repeat(20), ["A".repeat(20)]).length <= 20);
});

test("RateLimiter sliding-window chặn burst ranh giới và LRU eviction không khoá người mới", () => {
  let now = 900;
  const limiter = new RateLimiter(2, 1000, () => now, 2);
  assert.equal(limiter.allow("a"), true);
  assert.equal(limiter.allow("a"), true);
  assert.equal(limiter.allow("a"), false);
  // Qua ranh giới cửa sổ mới (t=1050): cửa sổ cũ vẫn còn trọng số 95% nên không cho burst 2x
  now = 1050;
  assert.equal(limiter.allow("a"), false);
  // Thêm khóa mới vượt maxKeys=2 sẽ đuổi khóa cũ nhất (LRU) thay vì từ chối toàn cục
  assert.equal(limiter.allow("b"), true);
  assert.equal(limiter.allow("c"), true);
  // Sau khi qua hẳn cửa sổ tiếp theo, khóa a được mở lại
  now = 2100;
  assert.equal(limiter.allow("a"), true);
});

test("Caro: 5 quân sát mép bàn bị chặn 1 đầu vẫn thắng, chặn 2 đầu bằng đối thủ không thắng", () => {
  // Sát mép trái (cột 0..4 là X, cột 5 là O) -> chỉ bị chặn 1 đầu nên thắng
  const edge = createEmptyBoard();
  for (let c = 0; c < 5; c++) edge[0][c] = "X";
  edge[0][5] = "O";
  assert.equal(checkWinner(edge, 0, 2, "X"), true);
  assert.equal(findWinningCells(edge, 0, 2, "X").length, 5);

  // Chặn 2 đầu bằng O -> không thắng
  const blocked = createEmptyBoard();
  blocked[3][1] = "O";
  for (let c = 2; c <= 6; c++) blocked[3][c] = "X";
  blocked[3][7] = "O";
  assert.equal(checkWinner(blocked, 3, 4, "X"), false);
  assert.equal(findWinningCells(blocked, 3, 4, "X").length, 0);

  // Vừa có đường ngang bị chặn 2 đầu vừa có đường dọc thắng -> trả về đúng 5 ô dọc
  for (let r = 3; r < 8; r++) blocked[r][4] = "X";
  const winCells = findWinningCells(blocked, 3, 4, "X");
  assert.equal(winCells.length, 5);
  assert.ok(winCells.every((cell) => cell.col === 4));
});

test("Caro: kiểm tra thắng chéo chính, chéo phụ, hoà và nước đi hợp lệ", () => {
  const diag1 = createEmptyBoard();
  for (let i = 0; i < 5; i++) diag1[2 + i][2 + i] = "X";
  assert.equal(checkWinner(diag1, 4, 4, "X"), true);

  const diag2 = createEmptyBoard();
  for (let i = 0; i < 5; i++) diag2[2 + i][10 - i] = "O";
  assert.equal(checkWinner(diag2, 4, 8, "O"), true);

  assert.equal(isValidMove(diag1, -1, 0), false);
  assert.equal(isValidMove(diag1, 0, 15), false);
  assert.equal(isValidMove(diag1, 2, 2), false);
  assert.equal(isValidMove(diag1, 0, 0), true);

  const full = createEmptyBoard().map((row, r) => row.map((_, c): "X" | "O" | null => ((r + c) % 2 === 0 ? "X" : "O")));
  assert.equal(isBoardFull(full), true);
  full[0][0] = null;
  assert.equal(isBoardFull(full), false);
});

test("generateRoomCode và isValidRoomCode sinh mã 6 ký tự chữ-số hợp lệ", () => {
  const codes = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const code = generateRoomCode();
    assert.equal(isValidRoomCode(code), true);
    codes.add(code);
  }
  assert.ok(codes.size >= 49);
  assert.equal(isValidRoomCode("ABC12"), false);
  assert.equal(isValidRoomCode("ABC1234"), false);
  assert.equal(isValidRoomCode("ABC-12"), false);
  assert.equal(isValidRoomCode(null), false);
});

test("readJsonObject chỉ nhận JSON object phẳng, từ chối null/mảng/chuỗi lỗi", async () => {
  const mk = (raw: string) => new Request("http://localhost/test", { method: "POST", body: raw });
  assert.deepEqual(await readJsonObject(mk('{"a":1}')), { a: 1 });
  assert.equal(await readJsonObject(mk("null")), null);
  assert.equal(await readJsonObject(mk("[1,2,3]")), null);
  assert.equal(await readJsonObject(mk('"hello"')), null);
  assert.equal(await readJsonObject(mk("{broken")), null);
});

test("player-token: xác thực chữ ký HMAC, hạn dùng và từ chối giả mạo/hết hạn", () => {
  const id = generateVisitorId();
  const now = 1_700_000_000_000;
  const token = signPlayerToken(id, now);
  assert.equal(isValidPlayerToken(id, token, now + 1000), true);
  assert.equal(isValidPlayerToken(id, token, now + 31 * 24 * 60 * 60 * 1000), false, "token hết hạn phải bị từ chối");
  assert.equal(isValidPlayerToken(id, "legacy-no-dot-token", now), false);
  assert.equal(isValidPlayerToken(id, token + "x", now), false);
  assert.equal(isValidPlayerToken("guest_other", token, now), false);
  assert.equal(isValidPlayerToken(null, token, now), false);
  assert.equal(isValidPlayerToken(id, undefined, now), false);
});

test("Sudoku extreme sinh nhanh, đúng ngưỡng <= 21 ô và lời giải hợp lệ", () => {
  const t0 = performance.now();
  for (let i = 0; i < 10; i++) {
    const p = generatePuzzle("extreme");
    assert.ok(p.givenCells >= 17 && p.givenCells <= 21, `expected 17..21 givens, got ${p.givenCells}`);
    assert.equal(isSolutionOf(p.solution, p.grid), true);
  }
  assert.ok(performance.now() - t0 < 500, "10 đề extreme phải sinh xong dưới 500ms");
});
