# Socket.io Events: Sudoku Multiplayer

**Branch**: `003-sudoku-game` | **Date**: 2025-12-02

## Connection

```typescript
// Client connects with player ID
io.connect('/game', {
  auth: { oderId: string, name: string }
});
```

## Client → Server Events

### Room Management

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ roomCode: string }` | Player joins a room |
| `leave_room` | `{ roomCode: string }` | Player leaves a room |
| `set_ready` | `{ roomCode: string, ready: boolean }` | Toggle ready status |
| `start_game` | `{ roomCode: string }` | Host starts the game |

### Gameplay

| Event | Payload | Description |
|-------|---------|-------------|
| `cell_update` | `{ roomCode: string, row: number, col: number, value: number \| null }` | Player updates a cell |
| `toggle_note` | `{ roomCode: string, row: number, col: number, note: number }` | Toggle note in cell |
| `request_progress` | `{ roomCode: string }` | Request all players' progress |
| `complete_puzzle` | `{ roomCode: string, grid: number[][] }` | Player claims completion |
| `give_up` | `{ roomCode: string }` | Player gives up |

### Connection

| Event | Payload | Description |
|-------|---------|-------------|
| `ping` | `{}` | Heartbeat |
| `reconnect_game` | `{ roomCode: string, lastState: GameState }` | Reconnect to ongoing game |

## Server → Client Events

### Room Updates

| Event | Payload | Description |
|-------|---------|-------------|
| `room_updated` | `Room` | Room state changed (player joined/left, ready status) |
| `player_joined` | `{ oderId: string, name: string }` | New player joined |
| `player_left` | `{ oderId: string, name: string, newHostId?: string }` | Player left, optional new host |
| `player_ready` | `{ oderId: string, ready: boolean }` | Player ready status changed |

### Game Flow

| Event | Payload | Description |
|-------|---------|-------------|
| `game_starting` | `{ countdown: number }` | Game starting in X seconds |
| `game_started` | `{ puzzle: number[][], startedAt: string }` | Game has started with puzzle |
| `game_paused` | `{ reason: string, resumeAt?: string }` | Game paused (host disconnect) |
| `game_resumed` | `{}` | Game resumed |
| `game_ended` | `GameResults` | Game has ended |

### Progress Updates

| Event | Payload | Description |
|-------|---------|-------------|
| `progress_update` | `{ oderId: string, progress: number, errors: number }` | Player progress updated |
| `player_completed` | `{ oderId: string, time: number, errors: number }` | Player finished puzzle |
| `player_gave_up` | `{ oderId: string }` | Player gave up |

### Validation

| Event | Payload | Description |
|-------|---------|-------------|
| `cell_validated` | `{ row: number, col: number, valid: boolean, conflicts?: {row: number, col: number}[] }` | Cell validation result |
| `error_recorded` | `{ oderId: string, totalErrors: number }` | Error count updated |

### Connection Status

| Event | Payload | Description |
|-------|---------|-------------|
| `player_disconnected` | `{ oderId: string, timeout: number }` | Player disconnected, showing timeout |
| `player_reconnected` | `{ oderId: string }` | Player reconnected |
| `pong` | `{}` | Heartbeat response |
| `error` | `{ code: string, message: string }` | Error occurred |

## Error Codes

| Code | Description |
|------|-------------|
| `ROOM_NOT_FOUND` | Room doesn't exist |
| `ROOM_FULL` | Room has 4 players |
| `GAME_ALREADY_STARTED` | Cannot join, game in progress |
| `NOT_HOST` | Action requires host privileges |
| `NOT_IN_ROOM` | Player not in the specified room |
| `INVALID_MOVE` | Invalid cell or value |
| `GAME_NOT_STARTED` | Action requires active game |

## State Sync Protocol

### On Reconnect

1. Client sends `reconnect_game` with last known state
2. Server compares timestamps
3. Server sends full state if client is behind
4. Server sends delta if client is only slightly behind

```typescript
// Reconnect payload
{
  roomCode: string,
  lastState: {
    grid: number[][],
    timestamp: number,
    progress: number
  }
}

// Server response
{
  fullSync: boolean,
  state?: GameState,        // if fullSync
  delta?: CellUpdate[],     // if not fullSync
  serverTime: number
}
```

## Rate Limiting

| Event | Limit |
|-------|-------|
| `cell_update` | 10/second per player |
| `toggle_note` | 20/second per player |
| `ping` | 1/second |
| Others | 5/second per player |
