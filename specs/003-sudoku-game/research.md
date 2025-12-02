# Research: Trang Chơi Sudoku

**Branch**: `003-sudoku-game` | **Date**: 2025-12-02

## 1. Sudoku Puzzle Generation

**Decision**: Use sudoku library (npm) for puzzle generation with difficulty levels

**Rationale**:
- Proven algorithm for generating valid, solvable puzzles
- Supports difficulty levels by controlling number of given cells
- Fast generation (<100ms per puzzle)

**Alternatives considered**:
- Custom implementation: More control but significant development time
- Pre-generated puzzle database: Simpler but limited variety

**Difficulty mapping**:
- Easy: 36-40 given cells (45-50% filled)
- Medium: 30-35 given cells (37-43% filled)
- Hard: 24-29 given cells (30-36% filled)

## 2. Real-time Multiplayer Architecture

**Decision**: Socket.io with Next.js custom server

**Rationale**:
- Native WebSocket fallback support
- Room-based communication built-in
- Seamless integration with Next.js
- Good documentation and community support

**Alternatives considered**:
- Pusher/Ably: Higher cost, external dependency
- Server-Sent Events: One-way only, not suitable for game actions
- WebSocket raw: More setup, less features

**Implementation approach**:
- Custom server.ts wrapping Next.js app
- Socket.io namespace for game rooms
- Events: join_room, leave_room, ready, start_game, update_progress, complete_game

## 3. Authentication Strategy

**Decision**: NextAuth.js with Credentials provider + Guest session

**Rationale**:
- Built for Next.js, easy setup
- Session management handled automatically
- Can extend to OAuth providers later
- Guest mode via temporary session tokens

**Implementation**:
- Registered users: email/password stored in MongoDB (bcrypt hashed)
- Guest users: Generate session ID, store name in localStorage + server session
- Both types can play, only registered users save history

## 4. State Management

**Decision**: React Context + useReducer for game state

**Rationale**:
- Built-in React, no external dependencies
- Suitable for game state complexity
- Easy to test and debug

**Alternatives considered**:
- Redux: Overkill for this scope
- Zustand: Good but adds dependency
- Jotai: Atomic but learning curve

**State structure**:
```typescript
interface GameState {
  puzzle: number[][];
  solution: number[][];
  userInput: (number | null)[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  mode: 'fill' | 'note';
  isPaused: boolean;
  timer: number;
  errors: number;
  progress: number;
}
```

## 5. Styling Approach

**Decision**: Tailwind CSS + Framer Motion

**Rationale**:
- Tailwind: Rapid development, built-in responsive utilities
- Framer Motion: Smooth animations for playful feel
- Both integrate well with Next.js

**UI Theme**:
- Light background (#f8fafc to #ffffff)
- Accent colors: Blue (#3b82f6), Green (#22c55e), Red (#ef4444)
- Rounded corners, soft shadows
- Subtle hover/click animations
- Playful icons (emoji or simple SVG)

## 6. MongoDB Schema Design

**Decision**: Embedded documents for game state, references for relationships

**Rationale**:
- Game state benefits from single-document reads
- User-Room relationship better as references (many-to-many)
- Indexes on room code and user email for quick lookups

**Collections**:
- `users`: User accounts with embedded game history
- `rooms`: Active rooms with embedded player states
- `puzzles`: Optional cache of generated puzzles (performance)

## 7. Error Handling & Edge Cases

**Decision**: Optimistic UI with server reconciliation

**Rationale**:
- Better perceived performance
- Handle network issues gracefully
- Server is source of truth for game completion

**Reconnection strategy**:
- Socket.io auto-reconnect enabled
- 30s grace period for host disconnect
- Client stores game state in sessionStorage as backup

## 8. Mobile UX Considerations

**Decision**: Touch-optimized number pad, responsive board scaling

**Implementation**:
- Board scales to fit viewport width on mobile
- Large touch targets (min 44px)
- Number pad fixed at bottom on mobile
- Swipe gestures disabled to prevent accidental navigation
