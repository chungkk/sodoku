# Socket.IO Events Contract

**Feature**: 001-multiplayer-sudoku  
**Transport**: Socket.IO over WebSocket

## Connection

### Client → Server

```typescript
// Connect with session authentication
io.connect('/game', {
  auth: {
    sessionId: string;  // From localStorage
  }
});
```

### Server → Client

```typescript
// Connection acknowledged
'connected': {
  playerId: string;
  displayName: string;
}

// Connection error
'connect_error': {
  message: string;
}
```

---

## Room Events

### Client → Server

#### `room:join`
Join a room after REST API call succeeds.
```typescript
{
  roomCode: string;
}
```

#### `room:leave`
Leave current room.
```typescript
{
  roomCode: string;
}
```

#### `room:ready`
Toggle ready status in lobby.
```typescript
{
  roomCode: string;
  isReady: boolean;
}
```

#### `room:start`
Host starts the game.
```typescript
{
  roomCode: string;
}
```

### Server → Client

#### `room:player-joined`
Broadcast when a player joins.
```typescript
{
  player: {
    id: string;
    displayName: string;
    isReady: boolean;
    isConnected: boolean;
  }
}
```

#### `room:player-left`
Broadcast when a player leaves.
```typescript
{
  playerId: string;
  newHostId?: string;  // If host left and transferred
}
```

#### `room:player-ready`
Broadcast when a player toggles ready.
```typescript
{
  playerId: string;
  isReady: boolean;
}
```

#### `room:player-disconnected`
Broadcast when a player loses connection.
```typescript
{
  playerId: string;
}
```

#### `room:player-reconnected`
Broadcast when a player reconnects.
```typescript
{
  playerId: string;
}
```

#### `room:error`
Error in room operation.
```typescript
{
  code: string;  // e.g., 'ROOM_FULL', 'NOT_HOST', 'GAME_STARTED'
  message: string;
}
```

---

## Game Events

### Server → Client

#### `game:starting`
Countdown before game starts (sent to all players).
```typescript
{
  countdown: number;  // Seconds until start (3, 2, 1)
}
```

#### `game:started`
Game has started (sent to all players simultaneously).
```typescript
{
  puzzle: string;           // 81-char initial board
  startTime: number;        // Unix timestamp (ms) - authoritative server time
  serverTimeOffset: number; // Client can adjust for latency
}
```

#### `game:player-completed`
Broadcast when a player completes (without revealing their solution).
```typescript
{
  playerId: string;
  displayName: string;
  rank: number;
  completionTime: number;  // Milliseconds
}
```

#### `game:player-gave-up`
Broadcast when a player gives up.
```typescript
{
  playerId: string;
  displayName: string;
}
```

#### `game:finished`
Broadcast when all players finished or gave up.
```typescript
{
  results: Array<{
    rank: number;
    playerId: string;
    displayName: string;
    completionTime: number | null;
    mistakesCount: number;
    status: 'completed' | 'gave_up';
  }>;
}
```

### Client → Server

#### `game:heartbeat`
Keep-alive to maintain connection during game.
```typescript
{
  roomCode: string;
  timestamp: number;
}
```

---

## Timer Synchronization

The timer is **server-authoritative**. Clients calculate elapsed time as:

```typescript
const elapsedMs = Date.now() - startTime + serverTimeOffset;
```

### Server → Client

#### `game:time-sync`
Periodic time sync (every 10 seconds during gameplay).
```typescript
{
  serverTime: number;      // Current server timestamp
  gameElapsed: number;     // Authoritative elapsed time (ms)
}
```

---

## Reconnection Flow

1. Client detects disconnect
2. Socket.IO auto-reconnects
3. Client emits `room:rejoin`:

```typescript
// Client → Server
'room:rejoin': {
  roomCode: string;
  sessionId: string;
}
```

4. Server responds with current state:

```typescript
// Server → Client
'room:state': {
  room: Room;
  gameState?: {
    puzzle: string;
    startTime: number;
    playerProgress: {
      currentBoard: string;
      mistakesCount: number;
      status: string;
    };
    completedPlayers: Array<{
      playerId: string;
      displayName: string;
      rank: number;
    }>;
  };
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `ROOM_NOT_FOUND` | Room code doesn't exist |
| `ROOM_FULL` | Room has max players |
| `GAME_ALREADY_STARTED` | Cannot join mid-game |
| `NOT_HOST` | Only host can perform this action |
| `NOT_ENOUGH_PLAYERS` | Need at least 2 players to start |
| `INVALID_SESSION` | Session ID not recognized |
| `ALREADY_IN_ROOM` | Player already in another room |
