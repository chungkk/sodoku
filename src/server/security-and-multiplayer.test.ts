import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { io as ioc, Socket } from "socket.io-client";
// Phải đứng trước mọi import dùng DB
import { testDbDir } from "../models/test-db";
import { getDb } from "../lib/db";
import { generateVisitorId, signPlayerToken } from "../lib/player-token";
import CaroRoom from "../models/CaroRoom";
import Puzzle from "../models/Puzzle";
import Room from "../models/Room";
import { setupSocketHandlers } from "./socket";
import { POST as createSudokuRoom } from "../app/api/rooms/route";
import { GET as getSudokuRoom } from "../app/api/rooms/[code]/route";
import { POST as joinSudokuRoom } from "../app/api/rooms/[code]/join/route";
import { POST as startSudokuRoom } from "../app/api/rooms/[code]/start/route";
import { GET as getSudokuProgress } from "../app/api/games/[roomCode]/progress/route";
import { GET as getSudokuState, POST as postSudokuState } from "../app/api/games/[roomCode]/state/route";
import { POST as completeSudoku } from "../app/api/games/[roomCode]/complete/route";
import { POST as checkSudoku } from "../app/api/games/[roomCode]/check/route";
import { POST as createCaroRoom } from "../app/api/caro/route";
import { GET as getCaroRoom } from "../app/api/caro/[code]/route";
import { POST as joinCaroRoom } from "../app/api/caro/[code]/join/route";
import { POST as startCaroRoom } from "../app/api/caro/[code]/start/route";
import { POST as makeCaroMove } from "../app/api/caro/[code]/move/route";

let httpServer: ReturnType<typeof createServer>;
let ioServer: SocketIOServer;
let baseUrl: string;

function mkPlayer(name: string) {
  const visitorId = generateVisitorId();
  return { visitorId, name, token: signPlayerToken(visitorId) };
}

function mkReq(url: string, body?: unknown, token?: string, rawBody?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) headers["x-player-token"] = token;
  if (rawBody !== undefined || body !== undefined) headers["Content-Type"] = "application/json";
  return new NextRequest(url, {
    method: rawBody !== undefined || body !== undefined ? "POST" : "GET",
    headers,
    body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function connectSocket(auth: { visitorId: string; name: string; token?: string }): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const s = ioc(baseUrl, {
      path: "/api/socketio",
      auth,
      transports: ["websocket"],
      reconnection: false,
    });
    const t = setTimeout(() => {
      s.disconnect();
      reject(new Error("connect timeout"));
    }, 3000);
    s.once("connect", () => {
      clearTimeout(t);
      resolve(s);
    });
    s.once("connect_error", (err) => {
      clearTimeout(t);
      s.disconnect();
      reject(err);
    });
  });
}

function waitForEvent<T = unknown>(s: Socket, event: string, timeoutMs = 400): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      s.off(event, onEvt);
      resolve(null);
    }, timeoutMs);
    const onEvt = (data: T) => {
      clearTimeout(t);
      resolve(data);
    };
    s.once(event, onEvt);
  });
}

before(async () => {
  httpServer = createServer();
  ioServer = new SocketIOServer(httpServer, { path: "/api/socketio" });
  setupSocketHandlers(ioServer);
  await new Promise<void>((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => resolve());
  });
  const addr = httpServer.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise<void>((resolve) => ioServer.close(() => resolve()));
  httpServer.close();
  getDb().close();
  rmSync(testDbDir, { recursive: true, force: true });
});

test("API validation: từ chối JSON null, kiểu dữ liệu sai và tên không hợp lệ bằng 400 thay vì 500", async () => {
  const alice = mkPlayer("Alice");

  const nullBody = await createSudokuRoom(mkReq("http://localhost/api/rooms", undefined, alice.token, "null"));
  assert.equal(nullBody.status, 400);

  const nonStringName = await createSudokuRoom(
    mkReq("http://localhost/api/rooms", { visitorId: alice.visitorId, hostName: 12345 }, alice.token)
  );
  assert.equal(nonStringName.status, 400);

  const blankName = await createSudokuRoom(
    mkReq("http://localhost/api/rooms", { visitorId: alice.visitorId, hostName: "   " }, alice.token)
  );
  assert.equal(blankName.status, 400);

  const tooLongName = await createSudokuRoom(
    mkReq("http://localhost/api/rooms", { visitorId: alice.visitorId, hostName: "A".repeat(25) }, alice.token)
  );
  assert.equal(tooLongName.status, 400);

  const caroNull = await createCaroRoom(mkReq("http://localhost/api/caro", undefined, alice.token, "null"));
  assert.equal(caroNull.status, 400);

  const badSudokuCode = await getSudokuRoom(mkReq("http://localhost/api/rooms/BAD"), {
    params: Promise.resolve({ code: "BAD" }),
  });
  assert.equal(badSudokuCode.status, 400);

  const badCaroCode = await getCaroRoom(mkReq("http://localhost/api/caro/BAD"), {
    params: Promise.resolve({ code: "BAD" }),
  });
  assert.equal(badCaroCode.status, 400);
});

test("API auth & business logic: chặn giả mạo token, thao túng số lỗi, ghi state lúc tạm dừng, và trả thời gian hoàn thành", async () => {
  const alice = mkPlayer("Alice");
  const bob = mkPlayer("Bob");

  // Missing / wrong token
  const noAuth = await createSudokuRoom(mkReq("http://localhost/api/rooms", { visitorId: alice.visitorId, hostName: "Alice" }));
  assert.equal(noAuth.status, 401);
  const wrongAuth = await createSudokuRoom(
    mkReq("http://localhost/api/rooms", { visitorId: alice.visitorId, hostName: "Alice" }, bob.token)
  );
  assert.equal(wrongAuth.status, 401);

  // Create + Join + Ready + Start
  const created = await (
    await createSudokuRoom(
      mkReq("http://localhost/api/rooms", { visitorId: alice.visitorId, hostName: "Alice", difficulty: "easy" }, alice.token)
    )
  ).json();
  const code = created.code as string;

  const badJoin = await joinSudokuRoom(
    mkReq(`http://localhost/api/rooms/${code}/join`, { visitorId: bob.visitorId, name: "   " }, bob.token),
    { params: Promise.resolve({ code }) }
  );
  assert.equal(badJoin.status, 400);

  const joined = await joinSudokuRoom(
    mkReq(`http://localhost/api/rooms/${code}/join`, { visitorId: bob.visitorId, name: "Bob" }, bob.token),
    { params: Promise.resolve({ code }) }
  );
  assert.equal(joined.status, 200);

  // Non-host cannot start
  const nonHostStart = await startSudokuRoom(
    mkReq(`http://localhost/api/rooms/${code}/start`, { visitorId: bob.visitorId }, bob.token),
    { params: Promise.resolve({ code }) }
  );
  assert.equal(nonHostStart.status, 403);

  Room.updatePlayerReady(code, bob.visitorId, true);
  const started = await startSudokuRoom(
    mkReq(`http://localhost/api/rooms/${code}/start`, { visitorId: alice.visitorId }, alice.token),
    { params: Promise.resolve({ code }) }
  );
  assert.equal(started.status, 200);

  // Error count cannot be decreased by client
  await postSudokuState(
    mkReq(`http://localhost/api/games/${code}/state`, { visitorId: alice.visitorId, errors: 7, elapsedTime: 50, progress: 40 }, alice.token),
    { params: Promise.resolve({ roomCode: code }) }
  );
  await postSudokuState(
    mkReq(`http://localhost/api/games/${code}/state`, { visitorId: alice.visitorId, errors: 0, elapsedTime: 5, progress: 45 }, alice.token),
    { params: Promise.resolve({ roomCode: code }) }
  );
  const stateRes = await (
    await getSudokuState(mkReq(`http://localhost/api/games/${code}/state?visitorId=${alice.visitorId}`, undefined, alice.token), {
      params: Promise.resolve({ roomCode: code }),
    })
  ).json();
  assert.equal(stateRes.errors, 7, "client không được hạ thấp số lỗi");
  assert.equal(stateRes.elapsedTime, 50, "client không được tua lùi elapsedTime");

  // State write rejected while paused
  const room = Room.findByCode(code)!;
  room.pause(alice.visitorId);
  room.save();
  const pausedStateRes = await postSudokuState(
    mkReq(`http://localhost/api/games/${code}/state`, { visitorId: bob.visitorId, progress: 60 }, bob.token),
    { params: Promise.resolve({ roomCode: code }) }
  );
  assert.equal(pausedStateRes.status, 400);

  room.resume();
  room.save();

  // Check limit (max 2)
  const puzzle = Puzzle.findById(room.puzzleId)!;
  const c1 = await checkSudoku(
    mkReq(`http://localhost/api/games/${code}/check`, { visitorId: alice.visitorId, grid: puzzle.grid }, alice.token),
    { params: Promise.resolve({ roomCode: code }) }
  );
  const c2 = await checkSudoku(
    mkReq(`http://localhost/api/games/${code}/check`, { visitorId: alice.visitorId, grid: puzzle.grid }, alice.token),
    { params: Promise.resolve({ roomCode: code }) }
  );
  const c3 = await checkSudoku(
    mkReq(`http://localhost/api/games/${code}/check`, { visitorId: alice.visitorId, grid: puzzle.grid }, alice.token),
    { params: Promise.resolve({ roomCode: code }) }
  );
  assert.equal(c1.status, 200);
  assert.equal(c2.status, 200);
  assert.equal(c3.status, 400);

  // Invalid solution rejected; valid solution accepted and progress endpoint exposes server time
  const badComplete = await (
    await completeSudoku(
      mkReq(`http://localhost/api/games/${code}/complete`, { visitorId: alice.visitorId, grid: puzzle.grid }, alice.token),
      { params: Promise.resolve({ roomCode: code }) }
    )
  ).json();
  assert.equal(badComplete.success, false);

  const okComplete = await (
    await completeSudoku(
      mkReq(`http://localhost/api/games/${code}/complete`, { visitorId: alice.visitorId, grid: puzzle.solution }, alice.token),
      { params: Promise.resolve({ roomCode: code }) }
    )
  ).json();
  assert.equal(okComplete.success, true);

  const prog = await (
    await getSudokuProgress(mkReq(`http://localhost/api/games/${code}/progress`), {
      params: Promise.resolve({ roomCode: code }),
    })
  ).json();
  const aliceProg = prog.players.find((p: { visitorId: string }) => p.visitorId === alice.visitorId);
  assert.equal(typeof aliceProg.time, "number");
  assert.ok(aliceProg.time >= 0);
});

test("Socket.IO security & room isolation: người ngoài không thể nghe lén hay bơm sự kiện vào phòng", async () => {
  const alice = mkPlayer("Alice");
  const bob = mkPlayer("Bob");
  const mallory = mkPlayer("Mallory");

  // Unauthenticated socket rejected
  await assert.rejects(() => connectSocket({ visitorId: alice.visitorId, name: "Alice", token: "invalid" }));

  const room = Room.createRoom(alice.visitorId, "Alice", "easy");
  room.addPlayer(bob.visitorId, "Bob");
  room.save();
  const code = room.code;

  const sAlice = await connectSocket(alice);
  const sBob = await connectSocket(bob);
  const sMallory = await connectSocket(mallory);

  try {
    sAlice.emit("join_room", { roomCode: code });
    sBob.emit("join_room", { roomCode: code });
    await new Promise((r) => setTimeout(r, 80));

    // Outsider tries to join and leave Alice's room
    sMallory.emit("join_room", { roomCode: code });
    await new Promise((r) => setTimeout(r, 80));

    const spoofLeft = waitForEvent(sAlice, "player_left", 300);
    sMallory.emit("leave_room", { roomCode: code });
    assert.equal(await spoofLeft, null, "người ngoài không được phát player_left vào phòng");

    // Start game and verify Mallory cannot eavesdrop on progress_update
    Room.updatePlayerReady(code, bob.visitorId, true);
    await startSudokuRoom(
      mkReq(`http://localhost/api/rooms/${code}/start`, { visitorId: alice.visitorId }, alice.token),
      { params: Promise.resolve({ code }) }
    );

    const eavesdrop = waitForEvent(sMallory, "progress_update", 300);
    const bobReceived = waitForEvent<{ progress: number }>(sBob, "progress_update", 500);
    sAlice.emit("progress_update", { roomCode: code, progress: 50, errors: 1 });
    assert.equal((await bobReceived)?.progress, 50);
    assert.equal(await eavesdrop, null, "người ngoài không được nghe lén progress_update");

    // Paused room blocks progress_update broadcast
    sAlice.emit("pause_game", { roomCode: code, paused: true });
    await new Promise((r) => setTimeout(r, 80));
    const whilePaused = waitForEvent(sBob, "progress_update", 250);
    sAlice.emit("progress_update", { roomCode: code, progress: 60, errors: 1 });
    assert.equal(await whilePaused, null, "đang tạm dừng thì không phát progress_update");
  } finally {
    sAlice.disconnect();
    sBob.disconnect();
    sMallory.disconnect();
  }
});

test("Socket.IO lobby leave: rời phòng chờ sẽ xoá khỏi DB và chuyển chủ phòng (Sudoku & Caro)", async () => {
  const alice = mkPlayer("Alice");
  const bob = mkPlayer("Bob");
  const room = Room.createRoom(alice.visitorId, "Alice", "easy");
  room.addPlayer(bob.visitorId, "Bob");
  room.save();

  const sAlice = await connectSocket(alice);
  const sBob = await connectSocket(bob);

  try {
    sAlice.emit("join_room", { roomCode: room.code });
    sBob.emit("join_room", { roomCode: room.code });
    await new Promise((r) => setTimeout(r, 80));

    sAlice.emit("leave_room", { roomCode: room.code });
    await new Promise((r) => setTimeout(r, 100));

    const updated = Room.findByCode(room.code)!;
    assert.equal(updated.players.length, 1);
    assert.equal(updated.hostId, bob.visitorId);

    // Caro room creation uses full 6-char alphanumeric and supports caro_leave_room + move validation
    const cCreated = await (
      await createCaroRoom(mkReq("http://localhost/api/caro", { visitorId: alice.visitorId, name: "Alice" }, alice.token))
    ).json();
    const cCode = cCreated.room.code as string;
    await joinCaroRoom(
      mkReq(`http://localhost/api/caro/${cCode}/join`, { visitorId: bob.visitorId, name: "Bob" }, bob.token),
      { params: Promise.resolve({ code: cCode }) }
    );
    sAlice.emit("caro_join_room", { roomCode: cCode });
    sBob.emit("caro_join_room", { roomCode: cCode });
    await new Promise((r) => setTimeout(r, 80));

    sBob.emit("caro_leave_room", { roomCode: cCode });
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(CaroRoom.findByCode(cCode)!.players.length, 1);

    // Re-join and verify server-side Caro move & win validation
    await joinCaroRoom(
      mkReq(`http://localhost/api/caro/${cCode}/join`, { visitorId: bob.visitorId, name: "Bob" }, bob.token),
      { params: Promise.resolve({ code: cCode }) }
    );
    CaroRoom.updatePlayerReady(cCode, alice.visitorId, true);
    CaroRoom.updatePlayerReady(cCode, bob.visitorId, true);
    const cStart = await startCaroRoom(
      mkReq(`http://localhost/api/caro/${cCode}/start`, { visitorId: alice.visitorId }, alice.token),
      { params: Promise.resolve({ code: cCode }) }
    );
    assert.equal(cStart.status, 200);

    // Out of turn rejected
    const oot = await makeCaroMove(
      mkReq(`http://localhost/api/caro/${cCode}/move`, { visitorId: bob.visitorId, row: 0, col: 0 }, bob.token),
      { params: Promise.resolve({ code: cCode }) }
    );
    assert.equal(oot.status, 400);

    // Play 5 in a row for X
    let lastWin: { hasWon?: boolean; winnerId?: string | null } = {};
    for (let i = 0; i < 5; i++) {
      const rx = await makeCaroMove(
        mkReq(`http://localhost/api/caro/${cCode}/move`, { visitorId: alice.visitorId, row: 7, col: 3 + i }, alice.token),
        { params: Promise.resolve({ code: cCode }) }
      );
      assert.equal(rx.status, 200);
      lastWin = await rx.json();
      if (i < 4) {
        const ro = await makeCaroMove(
          mkReq(`http://localhost/api/caro/${cCode}/move`, { visitorId: bob.visitorId, row: 8, col: 3 + i }, bob.token),
          { params: Promise.resolve({ code: cCode }) }
        );
        assert.equal(ro.status, 200);
      }
    }
    assert.equal(lastWin.hasWon, true);
    assert.equal(lastWin.winnerId, alice.visitorId);
  } finally {
    sAlice.disconnect();
    sBob.disconnect();
  }
});
