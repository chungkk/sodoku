# Quickstart: Multiplayer Sudoku Game

**Feature**: 001-multiplayer-sudoku  
**Date**: 2025-12-01

## Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas connection string)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (optional) |
| Sudoku | sudoku npm package |

## Project Setup

```bash
# Create Next.js project
npx create-next-app@latest sudoku-multiplayer --typescript --tailwind --eslint --app --src-dir

cd sudoku-multiplayer

# Install dependencies
npm install mongoose socket.io socket.io-client
npm install sudoku
npm install next-auth  # Optional for user registration

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog toast

# Dev dependencies
npm install -D @types/node
```

## Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sudoku
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sudoku

# NextAuth (optional)
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Home - Create/Join room
│   ├── room/
│   │   └── [code]/
│   │       └── page.tsx         # Room lobby & game
│   └── api/
│       ├── player/
│       │   ├── session/route.ts
│       │   ├── profile/route.ts
│       │   └── history/route.ts
│       ├── rooms/
│       │   ├── route.ts         # POST create room
│       │   └── [code]/
│       │       ├── route.ts     # GET room details
│       │       ├── join/route.ts
│       │       ├── leave/route.ts
│       │       └── start/route.ts
│       ├── games/
│       │   └── [roomCode]/
│       │       ├── progress/route.ts
│       │       ├── validate/route.ts
│       │       ├── complete/route.ts
│       │       └── results/route.ts
│       └── auth/
│           └── [...nextauth]/route.ts
│
├── components/
│   ├── SudokuBoard.tsx          # 9x9 grid component
│   ├── Cell.tsx                 # Individual cell
│   ├── NumberPad.tsx            # Number input buttons
│   ├── Timer.tsx                # Synchronized timer
│   ├── PlayerList.tsx           # Room lobby players
│   ├── Leaderboard.tsx          # Results display
│   └── ui/                      # shadcn components
│
├── lib/
│   ├── mongodb.ts               # DB connection
│   ├── socket.ts                # Socket.IO client
│   └── sudoku.ts                # Puzzle generation
│
├── models/
│   ├── User.ts
│   ├── Player.ts
│   ├── Room.ts
│   ├── Puzzle.ts
│   ├── PlayerProgress.ts
│   └── GameHistory.ts
│
├── hooks/
│   ├── useSocket.ts             # Socket.IO hook
│   ├── useGame.ts               # Game state hook
│   └── useTimer.ts              # Synchronized timer
│
├── contexts/
│   ├── PlayerContext.tsx        # Current player session
│   └── GameContext.tsx          # Game state
│
└── server/
    └── socket.ts                # Socket.IO server setup

server.ts                        # Custom server for Socket.IO
```

## Custom Server for Socket.IO

Create `server.ts` at project root:

```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './src/server/socket';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  setupSocketHandlers(io);

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

Update `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node --project tsconfig.server.json server.ts",
    "build": "next build",
    "start": "NODE_ENV=production ts-node --project tsconfig.server.json server.ts"
  }
}
```

## Key Implementation Notes

### 1. Sudoku Generation

```typescript
import { generate, solve } from 'sudoku';

// Generate puzzle with ~30 clues (medium difficulty)
const puzzle = generate(30);  // Returns 81-char string with '.' for empty
const solution = solve(puzzle);
```

### 2. Timer Synchronization

Server sends `startTime` timestamp. Clients calculate:

```typescript
const elapsed = Date.now() - startTime;
```

Periodic sync every 10s corrects drift.

### 3. Room Codes

Generate 6-char alphanumeric:

```typescript
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  return Array.from({ length: 6 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};
```

### 4. Guest Sessions

Store in localStorage:

```typescript
const sessionId = localStorage.getItem('sudoku_session') 
  || crypto.randomUUID();
localStorage.setItem('sudoku_session', sessionId);
```

## Running the Project

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Testing Strategy

| Type | Tool | Focus |
|------|------|-------|
| Unit | Jest | Sudoku validation, helpers |
| Component | React Testing Library | UI components |
| Integration | Cypress | Full game flow |
| E2E | Playwright | Multi-player scenarios |

```bash
# Install test dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress  # or playwright
```
