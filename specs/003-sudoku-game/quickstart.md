# Quickstart: Trang Chơi Sudoku

**Branch**: `003-sudoku-game` | **Date**: 2025-12-02

## Prerequisites

- Node.js 20.x
- MongoDB 6.x (local or Atlas)
- npm or yarn

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sudoku

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Socket.io (optional, for custom port)
SOCKET_PORT=3001
```

### 3. Start development server

```bash
npm run dev
```

This starts:
- Next.js app on http://localhost:3000
- Socket.io server on same port (or SOCKET_PORT if specified)

## Key Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:seed` | Seed database with sample puzzles |

## Project Structure Quick Reference

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Home - mode selection
│   ├── practice/        # Practice mode
│   ├── room/[code]/     # Multiplayer room
│   └── api/             # REST API routes
├── components/          # React components
│   ├── SudokuBoard.tsx  # Main game board
│   ├── NumberPad.tsx    # Number input
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & configs
├── models/              # MongoDB schemas
└── server/              # Socket.io handlers
```

## Quick Development Tasks

### Add a new page

```bash
# Create page file
touch src/app/your-page/page.tsx
```

### Add a new API route

```bash
# Create route file
touch src/app/api/your-route/route.ts
```

### Add a new component

```bash
# Create component file
touch src/components/YourComponent.tsx
```

### Test Socket.io events

```javascript
// In browser console
const socket = io();
socket.emit('join_room', { roomCode: 'ABC123' });
socket.on('room_updated', (data) => console.log(data));
```

## Debugging

### MongoDB queries

```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/sudoku

# View rooms
db.rooms.find().pretty()

# View active games
db.rooms.find({ status: 'playing' }).pretty()
```

### Socket.io debugging

Enable debug mode:

```bash
DEBUG=socket.io* npm run dev
```

### Next.js debugging

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Then open `chrome://inspect` in Chrome.

## Common Issues

### MongoDB connection failed

1. Check MongoDB is running: `mongosh` should connect
2. Verify MONGODB_URI in .env.local
3. Check network/firewall settings

### Socket.io not connecting

1. Check browser console for errors
2. Verify same origin or CORS settings
3. Check if port is available

### Hot reload not working

1. Clear `.next` folder: `rm -rf .next`
2. Restart dev server
3. Check for syntax errors in changed files

## API Testing

Use the included REST client file or curl:

```bash
# Create guest session
curl -X POST http://localhost:3000/api/player/session \
  -H "Content-Type: application/json" \
  -d '{"name": "TestPlayer"}'

# Create room
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "medium"}'
```

## Deployment Notes

### Vercel (recommended)

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

**Note**: Socket.io requires serverless adapter or separate server for Vercel.

### Self-hosted

```bash
npm run build
npm run start
```

Use PM2 for process management:

```bash
pm2 start npm --name "sudoku" -- start
```
