import { getDb } from "../lib/db";

const MAX_HISTORY = 50;

export interface GameRecord {
  date: Date;
  mode: "practice" | "solo";
  difficulty: "easy" | "medium" | "hard";
  time: number;
  errors: number;
  result: "completed" | "abandoned" | "won" | "lost";
  roomCode?: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
}

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  stats: string;
  game_history: string;
  created_at: string;
  updated_at: string;
}

export default class User {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string;
  stats: UserStats;
  gameHistory: GameRecord[];
  createdAt: Date;
  updatedAt: Date;

  private constructor(row: UserRow) {
    this.id = row.id;
    this.email = row.email;
    this.passwordHash = row.password_hash;
    this.displayName = row.display_name;
    this.stats = JSON.parse(row.stats);
    this.gameHistory = JSON.parse(row.game_history).map(
      (g: Omit<GameRecord, "date"> & { date: string }) => ({ ...g, date: new Date(g.date) })
    );
    this.createdAt = new Date(row.created_at);
    this.updatedAt = new Date(row.updated_at);
  }

  static findById(id: string | number): User | null {
    const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
    return row ? new User(row as unknown as UserRow) : null;
  }

  static findByEmail(email: string): User | null {
    const row = getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.trim().toLowerCase());
    return row ? new User(row as unknown as UserRow) : null;
  }

  addGameRecord(record: Omit<GameRecord, "date">): void {
    this.gameHistory = [{ ...record, date: new Date() }, ...this.gameHistory].slice(0, MAX_HISTORY);

    this.stats.totalGames += 1;
    if (record.result === "won") {
      this.stats.wins += 1;
    }

    const currentBest = this.stats.bestTime[record.difficulty];
    if (
      (record.result === "completed" || record.result === "won") &&
      (currentBest === null || record.time < currentBest)
    ) {
      this.stats.bestTime[record.difficulty] = record.time;
    }

    this.updatedAt = new Date();
    getDb()
      .prepare("UPDATE users SET stats = ?, game_history = ?, updated_at = ? WHERE id = ?")
      .run(
        JSON.stringify(this.stats),
        JSON.stringify(this.gameHistory),
        this.updatedAt.toISOString(),
        this.id
      );
  }
}
