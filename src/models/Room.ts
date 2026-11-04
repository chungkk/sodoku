import { getDb, toDate } from "../lib/db";
import { pickWinnerId } from "../lib/ranking";
import type { Difficulty } from "./Puzzle";

export type RoomStatus = "waiting" | "playing" | "finished";

const MAX_PLAYERS = 4;
const MAX_NAME_LENGTH = 20;
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

export interface IPlayer {
  visitorId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  progress: number;
  errors: number;
  currentGrid: number[][];
  notes: number[][][];
  elapsedTime: number;
  finishedAt: Date | null;
  lastSeen: Date;
}

type StoredPlayer = Omit<IPlayer, "finishedAt" | "lastSeen"> & {
  finishedAt: string | null;
  lastSeen: string;
};

interface RoomData {
  hostId: string;
  puzzleId: number | null;
  players: StoredPlayer[];
  difficulty: Difficulty;
  startedAt: string | null;
  finishedAt: string | null;
  winnerId: string | null;
}

interface RoomRow {
  code: string;
  status: string;
  created_at: string;
  data: string;
}

function cleanName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Player name must be 1-${MAX_NAME_LENGTH} characters`);
  }
  return trimmed;
}

function newPlayer(visitorId: string, name: string, isHost: boolean): IPlayer {
  return {
    visitorId,
    name: cleanName(name),
    isHost,
    isReady: isHost,
    isConnected: true,
    progress: 0,
    errors: 0,
    currentGrid: [],
    notes: [],
    elapsedTime: 0,
    finishedAt: null,
    lastSeen: new Date(),
  };
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default class Room {
  code: string;
  hostId: string;
  puzzleId: number | null;
  players: IPlayer[];
  status: RoomStatus;
  difficulty: Difficulty;
  startedAt: Date | null;
  finishedAt: Date | null;
  winnerId: string | null;
  createdAt: Date;

  private constructor(row: RoomRow) {
    const data: RoomData = JSON.parse(row.data);
    this.code = row.code;
    this.status = row.status as RoomStatus;
    this.createdAt = new Date(row.created_at);
    this.hostId = data.hostId;
    this.puzzleId = data.puzzleId;
    this.difficulty = data.difficulty;
    this.startedAt = toDate(data.startedAt);
    this.finishedAt = toDate(data.finishedAt);
    this.winnerId = data.winnerId;
    this.players = data.players.map((p) => ({
      ...p,
      finishedAt: toDate(p.finishedAt),
      lastSeen: new Date(p.lastSeen),
    }));
  }

  private serialize(): string {
    // Date được JSON.stringify thành chuỗi ISO, đúng với kiểu StoredPlayer
    return JSON.stringify({
      hostId: this.hostId,
      puzzleId: this.puzzleId,
      players: this.players,
      difficulty: this.difficulty,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      winnerId: this.winnerId,
    });
  }

  static findByCode(code: string): Room | null {
    const row = getDb().prepare("SELECT * FROM rooms WHERE code = ?").get(code);
    return row ? new Room(row as unknown as RoomRow) : null;
  }

  /** Các phòng đang chờ, mới có một người, tạo sau thời điểm `since` (mới nhất trước). */
  static findOpen(since: Date, limit: number): Room[] {
    const rows = getDb()
      .prepare(
        `SELECT * FROM rooms
         WHERE status = 'waiting' AND created_at >= ? AND json_array_length(data, '$.players') < 2
         ORDER BY created_at DESC LIMIT ?`
      )
      .all(since.toISOString(), limit);
    return rows.map((row) => new Room(row as unknown as RoomRow));
  }

  static createRoom(
    hostId: string,
    hostName: string,
    difficulty: Difficulty
  ): Room {
    const db = getDb();
    const now = new Date();

    // Phòng chỉ sống 24 giờ; chỉ phát sinh dữ liệu khi có phòng mới nên dọn luôn ở đây.
    db.prepare("DELETE FROM rooms WHERE created_at < ?").run(
      new Date(now.getTime() - ROOM_TTL_MS).toISOString()
    );

    let code = generateCode();
    while (db.prepare("SELECT 1 FROM rooms WHERE code = ?").get(code)) {
      code = generateCode();
    }

    const data = JSON.stringify({
      hostId,
      puzzleId: null,
      players: [newPlayer(hostId, hostName, true)],
      difficulty,
      startedAt: null,
      finishedAt: null,
      winnerId: null,
    });
    db.prepare("INSERT INTO rooms (code, status, created_at, data) VALUES (?, 'waiting', ?, ?)").run(
      code,
      now.toISOString(),
      data
    );
    return Room.findByCode(code)!;
  }

  static findPlaying(): Room[] {
    const rows = getDb().prepare("SELECT * FROM rooms WHERE status = 'playing'").all();
    return rows.map((row) => new Room(row as unknown as RoomRow));
  }

  /** Đổi trạng thái sẵn sàng khi chỉ có code phòng (socket). Bỏ qua nếu không có phòng hoặc người chơi. */
  static updatePlayerReady(code: string, visitorId: string, ready: boolean): void {
    const room = Room.findByCode(code);
    const player = room?.players.find((p) => p.visitorId === visitorId);
    if (!room || !player) return;
    player.isReady = ready;
    room.save();
  }

  save(): void {
    getDb()
      .prepare("UPDATE rooms SET status = ?, data = ? WHERE code = ?")
      .run(this.status, this.serialize(), this.code);
  }

  delete(): void {
    getDb().prepare("DELETE FROM rooms WHERE code = ?").run(this.code);
  }

  addPlayer(visitorId: string, name: string): boolean {
    if (this.players.length >= MAX_PLAYERS) return false;
    if (this.status !== "waiting") return false;
    if (this.players.some((p) => p.visitorId === visitorId)) return false;

    this.players.push(newPlayer(visitorId, name, false));
    return true;
  }

  removePlayer(visitorId: string): boolean {
    const index = this.players.findIndex((p) => p.visitorId === visitorId);
    if (index === -1) return false;

    const wasHost = this.players[index].isHost;
    this.players.splice(index, 1);

    if (wasHost && this.players.length > 0) {
      this.players[0].isHost = true;
      this.hostId = this.players[0].visitorId;
    }
    return true;
  }

  get isFinished(): boolean {
    return this.status === "finished";
  }

  /** Kết thúc ván nếu không còn ai đang chơi. Người gọi tự save(). */
  finishIfAllDone(): void {
    if (this.players.some((p) => !p.finishedAt)) return;
    this.status = "finished";
    this.finishedAt = new Date();
    this.winnerId = pickWinnerId(this.players);
  }

  /** Bỏ cuộc hoặc bị xử thua. False nếu người này đã xong ván. Người gọi tự save(). */
  giveUp(visitorId: string): boolean {
    const player = this.players.find((p) => p.visitorId === visitorId);
    if (!player || player.finishedAt) return false;
    player.progress = -1;
    player.finishedAt = new Date();
    this.finishIfAllDone();
    return true;
  }

  canStart(): boolean {
    if (this.status !== "waiting") return false;
    if (this.players.length < 2) return false;
    return this.players.some((p) => !p.isHost && p.isReady);
  }
}
