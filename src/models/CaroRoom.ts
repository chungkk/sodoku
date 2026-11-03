import type { Board } from "../lib/caro";
import { getDb, toDate } from "../lib/db";

export type CaroSymbol = "X" | "O";
export type CaroStatus = "waiting" | "playing" | "finished";

export interface ICaroPlayer {
  visitorId: string;
  name: string;
  symbol: CaroSymbol | null;
  isReady: boolean;
  isConnected: boolean;
}

export interface ICaroMove {
  row: number;
  col: number;
  symbol: CaroSymbol;
  timestamp: Date;
}

interface CaroRow {
  code: string;
  status: string;
  created_at: string;
  data: string;
}

interface NewCaroRoom {
  code: string;
  players: ICaroPlayer[];
  board: Board;
  currentTurn: CaroSymbol;
  status: CaroStatus;
}

export default class CaroRoom {
  code: string;
  players: ICaroPlayer[];
  board: Board;
  currentTurn: CaroSymbol;
  status: CaroStatus;
  winnerId: string | null;
  moves: ICaroMove[];
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  turnStartedAt: Date | null;

  private constructor(row: CaroRow) {
    const data = JSON.parse(row.data);
    this.code = row.code;
    this.status = row.status as CaroStatus;
    this.createdAt = new Date(row.created_at);
    this.players = data.players;
    this.board = data.board;
    this.currentTurn = data.currentTurn;
    this.winnerId = data.winnerId;
    this.moves = data.moves.map((m: Omit<ICaroMove, "timestamp"> & { timestamp: string }) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
    this.startedAt = toDate(data.startedAt);
    this.finishedAt = toDate(data.finishedAt);
    this.turnStartedAt = toDate(data.turnStartedAt);
  }

  private serialize(): string {
    return JSON.stringify({
      players: this.players,
      board: this.board,
      currentTurn: this.currentTurn,
      winnerId: this.winnerId,
      moves: this.moves,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      turnStartedAt: this.turnStartedAt,
    });
  }

  static create(room: NewCaroRoom): CaroRoom {
    const data = JSON.stringify({
      players: room.players,
      board: room.board,
      currentTurn: room.currentTurn,
      winnerId: null,
      moves: [],
      startedAt: null,
      finishedAt: null,
      turnStartedAt: null,
    });
    getDb()
      .prepare("INSERT INTO caro_rooms (code, status, created_at, data) VALUES (?, ?, ?, ?)")
      .run(room.code, room.status, new Date().toISOString(), data);
    return CaroRoom.findByCode(room.code)!;
  }

  static findByCode(code: string): CaroRoom | null {
    const row = getDb().prepare("SELECT * FROM caro_rooms WHERE code = ?").get(code);
    return row ? new CaroRoom(row as unknown as CaroRow) : null;
  }

  /** Các phòng chưa kết thúc, tạo sau thời điểm `since` (mới nhất trước). */
  static findActive(since: Date, limit: number): CaroRoom[] {
    const rows = getDb()
      .prepare(
        `SELECT * FROM caro_rooms
         WHERE status IN ('waiting', 'playing') AND created_at >= ?
         ORDER BY created_at DESC LIMIT ?`
      )
      .all(since.toISOString(), limit);
    return rows.map((row) => new CaroRoom(row as unknown as CaroRow));
  }

  /** Các phòng đang chờ, mới có một người, tạo sau thời điểm `since` (mới nhất trước). */
  static findOpen(since: Date, limit: number): CaroRoom[] {
    const rows = getDb()
      .prepare(
        `SELECT * FROM caro_rooms
         WHERE status = 'waiting' AND created_at >= ? AND json_array_length(data, '$.players') < 2
         ORDER BY created_at DESC LIMIT ?`
      )
      .all(since.toISOString(), limit);
    return rows.map((row) => new CaroRoom(row as unknown as CaroRow));
  }

  /** Đổi trạng thái sẵn sàng khi chỉ có code phòng (socket). Bỏ qua nếu không có phòng hoặc người chơi. */
  static updatePlayerReady(code: string, visitorId: string, ready: boolean): void {
    const room = CaroRoom.findByCode(code);
    const player = room?.players.find((p) => p.visitorId === visitorId);
    if (!room || !player) return;
    player.isReady = ready;
    room.save();
  }

  save(): void {
    getDb()
      .prepare("UPDATE caro_rooms SET status = ?, data = ? WHERE code = ?")
      .run(this.status, this.serialize(), this.code);
  }
}
