# Data Model: Trang Chơi Sudoku

**Branch**: `003-sudoku-game` | **Date**: 2025-12-02

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Room     │       │   Puzzle    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ _id         │       │ _id         │       │ _id         │
│ email       │◄──────│ hostId      │       │ grid        │
│ password    │       │ code        │───────►│ solution    │
│ displayName │       │ puzzleId    │       │ difficulty  │
│ gameHistory │       │ players[]   │       │ createdAt   │
│ createdAt   │       │ status      │       └─────────────┘
└─────────────┘       │ difficulty  │
                      │ createdAt   │
                      └─────────────┘
                            │
                            │ embedded
                            ▼
                      ┌─────────────┐
                      │   Player    │
                      ├─────────────┤
                      │ oderId      │
                      │ oderId      │
                      │ name        │
                      │ isHost      │
                      │ isReady     │
                      │ progress    │
                      │ errors      │
                      │ finishedAt  │
                      └─────────────┘
```

## Collections

### User

```typescript
interface User {
  _id: ObjectId;
  email: string;              // unique, indexed
  passwordHash: string;       // bcrypt hashed
  displayName: string;
  gameHistory: GameRecord[];  // embedded, last 50 games
  stats: {
    totalGames: number;
    wins: number;
    bestTime: {
      easy: number | null;    // seconds
      medium: number | null;
      hard: number | null;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface GameRecord {
  date: Date;
  mode: 'practice' | 'solo';
  difficulty: 'easy' | 'medium' | 'hard';
  time: number;               // seconds to complete
  errors: number;
  result: 'completed' | 'abandoned' | 'won' | 'lost';
  roomCode?: string;          // only for solo mode
}
```

**Indexes**:
- `email`: unique
- `createdAt`: descending (for admin queries)

**Validation**:
- email: valid email format, unique
- displayName: 2-20 characters, alphanumeric + spaces
- passwordHash: min 60 characters (bcrypt)

### Room

```typescript
interface Room {
  _id: ObjectId;
  code: string;               // 6 characters, uppercase, unique
  hostId: string;             // oderId of host (oderId = oderId hoặc oderId)
  puzzleId: ObjectId;         // reference to Puzzle
  players: Player[];          // embedded, max 4
  status: 'waiting' | 'playing' | 'finished';
  difficulty: 'easy' | 'medium' | 'hard';
  startedAt: Date | null;
  finishedAt: Date | null;
  winnerId: string | null;    // oderId of winner
  createdAt: Date;
}

interface Player {
  oderId: string;             // oderId hoặc oderId
  oderId: ObjectId | null;    // null for guests
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  progress: number;           // 0-100 percentage
  errors: number;             // count of wrong inputs
  currentGrid: number[][];    // player's current state
  finishedAt: Date | null;
  lastSeen: Date;
}
```

**Indexes**:
- `code`: unique
- `status`: for finding active rooms
- `createdAt`: TTL index (auto-delete after 24 hours)

**Validation**:
- code: exactly 6 uppercase alphanumeric
- players: max 4 items
- difficulty: enum ['easy', 'medium', 'hard']
- status: enum ['waiting', 'playing', 'finished']

### Puzzle

```typescript
interface Puzzle {
  _id: ObjectId;
  grid: number[][];           // 9x9, 0 = empty
  solution: number[][];       // 9x9, all filled
  difficulty: 'easy' | 'medium' | 'hard';
  givenCells: number;         // count of pre-filled cells
  createdAt: Date;
}
```

**Indexes**:
- `difficulty`: for random selection
- `createdAt`: descending

**Validation**:
- grid: 9x9 array, values 0-9
- solution: 9x9 array, values 1-9
- givenCells: 24-40 based on difficulty

## State Transitions

### Room Status

```
┌─────────────┐     host starts      ┌─────────────┐    someone wins    ┌──────────────┐
│   waiting   │ ──────────────────► │   playing   │ ─────────────────► │   finished   │
└─────────────┘                      └─────────────┘                    └──────────────┘
      │                                    │
      │ all players leave                  │ host disconnect timeout
      ▼                                    ▼
┌─────────────┐                      ┌──────────────┐
│  (deleted)  │                      │   finished   │
└─────────────┘                      └──────────────┘
```

### Player States

```
┌─────────────┐      click ready     ┌─────────────┐
│  not_ready  │ ──────────────────► │    ready    │
└─────────────┘                      └─────────────┘
                                           │
                                           │ game starts
                                           ▼
┌─────────────┐      complete        ┌─────────────┐
│   playing   │ ──────────────────► │  finished   │
└─────────────┘                      └─────────────┘
      │
      │ disconnect > 30s
      ▼
┌──────────────┐
│ disconnected │
└──────────────┘
```

## Data Volume Estimates

| Collection | Documents | Avg Size | Total Size |
|------------|-----------|----------|------------|
| users      | 1,000     | 2 KB     | 2 MB       |
| rooms      | 100 active| 5 KB     | 500 KB     |
| puzzles    | 1,000     | 1 KB     | 1 MB       |

**Notes**:
- Rooms auto-deleted after 24 hours via TTL index
- Game history limited to 50 most recent per user
- Puzzles can be pre-generated for faster game start
