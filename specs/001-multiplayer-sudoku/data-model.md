# Data Model: Multiplayer Sudoku Game

**Feature**: 001-multiplayer-sudoku  
**Date**: 2025-12-01  
**Database**: MongoDB

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Room     │       │   Puzzle    │
│  (optional) │       │             │       │             │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │
       │ 1:N                 │ 1:N                 │ 1:1
       │                     │                     │
       ▼                     ▼                     │
┌─────────────┐       ┌─────────────┐              │
│   Player    │◄──────│PlayerProgress│◄────────────┘
│  (session)  │       │             │
└─────────────┘       └─────────────┘
       │
       │ N:1
       ▼
┌─────────────┐
│ GameHistory │
└─────────────┘
```

## Collections

### 1. User (Optional - Registered Users Only)

```typescript
interface User {
  _id: ObjectId;
  email: string;              // Unique, indexed
  passwordHash: string;       // bcrypt hashed
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Aggregated stats (cached, updated after each game)
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;    // in seconds
    averageTime: number;      // in seconds
    bestTime: number;         // in seconds
  };
}
```

**Indexes**:
- `email`: unique
- `createdAt`: for cleanup queries

**Validation Rules**:
- Email: valid email format, max 255 chars
- DisplayName: 2-20 chars, alphanumeric + spaces
- Password: min 8 chars (before hashing)

---

### 2. Player (Session-based - Guests & Registered)

```typescript
interface Player {
  _id: ObjectId;
  sessionId: string;          // UUID, stored in client localStorage
  displayName: string;
  
  // Optional link to registered user
  userId?: ObjectId;          // Reference to User collection
  
  isGuest: boolean;
  createdAt: Date;
  lastActiveAt: Date;         // For session cleanup
  
  // Current state
  currentRoomCode?: string;   // Room they're in (if any)
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}
```

**Indexes**:
- `sessionId`: unique
- `userId`: sparse (only for registered users)
- `lastActiveAt`: for cleanup queries
- `currentRoomCode`: for quick lookups

**Validation Rules**:
- SessionId: UUID v4 format
- DisplayName: 2-20 chars

**State Transitions**:
```
[New] → connected → disconnected → reconnecting → connected
                         ↓
                    [Expired after 30 days]
```

---

### 3. Room

```typescript
interface Room {
  _id: ObjectId;
  code: string;               // 6-char alphanumeric, e.g., "ABC123"
  
  hostPlayerId: ObjectId;     // Reference to Player
  players: ObjectId[];        // Array of Player references (2-4)
  
  status: 'waiting' | 'playing' | 'finished';
  
  // Game settings
  settings: {
    difficulty: 'easy' | 'medium' | 'hard';
    maxPlayers: number;       // 2-4, default 4
  };
  
  // Puzzle (populated when game starts)
  puzzleId?: ObjectId;        // Reference to Puzzle
  
  // Timing
  gameStartedAt?: Date;       // Server timestamp when game started
  gameEndedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `code`: unique
- `status`: for filtering active rooms
- `createdAt`: for cleanup (TTL index - auto-delete after 24 hours)

**Validation Rules**:
- Code: exactly 6 uppercase alphanumeric chars
- Players: min 0, max 4

**State Transitions**:
```
[Created] → waiting → playing → finished → [Deleted/Archived]
                ↓
           [Deleted if empty for 30 min]
```

---

### 4. Puzzle

```typescript
interface Puzzle {
  _id: ObjectId;
  
  // 9x9 grid represented as 81-char string (row by row)
  // 0 = empty cell, 1-9 = given number
  initialBoard: string;       // e.g., "530070000600195000..."
  solution: string;           // Complete solution
  
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Metadata
  givens: number;             // Count of pre-filled cells (easy: 40+, medium: 30-39, hard: <30)
  createdAt: Date;
}
```

**Indexes**:
- `difficulty`: for random selection
- `createdAt`: for variety in selection

**Validation Rules**:
- InitialBoard: exactly 81 chars, digits 0-9
- Solution: exactly 81 chars, digits 1-9
- Givens: 17-81 (17 is minimum for unique solution)

---

### 5. PlayerProgress

```typescript
interface PlayerProgress {
  _id: ObjectId;
  
  roomId: ObjectId;           // Reference to Room
  playerId: ObjectId;         // Reference to Player
  
  // Current board state
  currentBoard: string;       // 81-char string, player's current progress
  
  // Performance tracking
  mistakesCount: number;
  hintsUsed: number;
  
  // Completion
  status: 'playing' | 'completed' | 'gave_up';
  completionTime?: number;    // Milliseconds from game start
  completedAt?: Date;
  
  // Ranking (set when game ends)
  rank?: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `roomId`: for fetching all progress in a room
- `playerId`: for player's history
- `{ roomId, playerId }`: compound unique

**Validation Rules**:
- CurrentBoard: exactly 81 chars, digits 0-9
- MistakesCount: non-negative integer
- CompletionTime: positive integer when set

**State Transitions**:
```
[Created] → playing → completed
                 ↓
              gave_up
```

---

### 6. GameHistory

```typescript
interface GameHistory {
  _id: ObjectId;
  
  playerId: ObjectId;         // Reference to Player
  roomCode: string;           // Preserved even after room deleted
  
  // Game details
  difficulty: 'easy' | 'medium' | 'hard';
  playersCount: number;       // How many were in the room
  
  // Results
  rank: number;               // 1st, 2nd, 3rd, 4th
  completionTime?: number;    // Milliseconds (null if didn't finish)
  mistakesCount: number;
  didComplete: boolean;
  
  playedAt: Date;
}
```

**Indexes**:
- `playerId`: for player's game history
- `playedAt`: for sorting/pagination
- `{ playerId, playedAt }`: compound for efficient queries

## In-Memory State (Not Persisted)

For real-time performance, active room state is kept in server memory:

```typescript
interface ActiveRoom {
  code: string;
  hostSocketId: string;
  
  players: Map<string, {      // Key: socketId
    playerId: string;
    displayName: string;
    isReady: boolean;
    isConnected: boolean;
  }>;
  
  // Game state
  status: 'waiting' | 'playing' | 'finished';
  gameStartTime?: number;     // Unix timestamp ms
  
  // Synced to DB periodically and on key events
}
```

## Data Retention Policy

| Collection | Retention | Cleanup Trigger |
|------------|-----------|-----------------|
| User | Permanent | Manual deletion |
| Player (guest) | 30 days inactive | Cron job |
| Player (registered) | Permanent | Account deletion |
| Room | 24 hours | TTL index |
| Puzzle | Permanent | None |
| PlayerProgress | 7 days after game | Cron job |
| GameHistory | 1 year | Cron job |
