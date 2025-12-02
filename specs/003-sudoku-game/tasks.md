# Tasks: Trang Chơi Sudoku

**Input**: Design documents from `/specs/003-sudoku-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - test tasks excluded.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5)
- Exact file paths included

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with Next.js 14, MongoDB, Socket.io

- [x] T001 Initialize Next.js 14 project with TypeScript and App Router
- [x] T002 Install dependencies: mongoose, socket.io, socket.io-client, next-auth, bcryptjs
- [x] T003 [P] Install UI dependencies: tailwindcss, framer-motion, @tailwindcss/forms
- [x] T004 [P] Configure Tailwind CSS in tailwind.config.ts
- [x] T005 [P] Configure TypeScript paths in tsconfig.json
- [x] T006 [P] Create .env.local template with MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL
- [x] T007 [P] Setup ESLint config in eslint.config.mjs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Models

- [x] T008 Create MongoDB connection utility in src/lib/mongodb.ts
- [x] T009 [P] Create User model with schema in src/models/User.ts
- [x] T010 [P] Create Puzzle model with schema in src/models/Puzzle.ts
- [x] T011 [P] Create Room model with embedded Player schema in src/models/Room.ts

### Authentication

- [x] T012 Create auth utilities and session handling in src/lib/auth.ts
- [x] T013 Implement NextAuth config with credentials provider in src/app/api/auth/[...nextauth]/route.ts
- [x] T014 [P] Create PlayerContext for session management in src/contexts/PlayerContext.tsx

### Real-time Infrastructure

- [x] T015 Create Socket.io client setup in src/lib/socket.ts
- [x] T016 Create custom server with Socket.io in server.ts
- [x] T017 Implement Socket.io server handlers base in src/server/socket.ts

### Core Utilities

- [x] T018 Implement Sudoku puzzle generator with difficulty levels in src/lib/sudoku.ts
- [x] T019 Add puzzle validation functions (check conflicts) in src/lib/sudoku.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 + 5 - Practice Mode & UI (Priority: P1) 🎯 MVP

**Goal**: Single-player Sudoku with responsive, animated UI - complete standalone experience

**Independent Test**: Open app → Select difficulty → Play Sudoku → Complete puzzle → See victory message

### Core UI Components (US5)

- [x] T020 [P] [US5] Create base Button component in src/components/ui/button.tsx
- [x] T021 [P] [US5] Create base Card component in src/components/ui/card.tsx
- [x] T022 [P] [US5] Create base Input component in src/components/ui/input.tsx
- [x] T023 [P] [US5] Create base Dialog component in src/components/ui/dialog.tsx
- [x] T024 [P] [US5] Create base Select component in src/components/ui/select.tsx

### Layout Components (US5)

- [x] T025 [P] [US5] Create Header with logo and nav in src/components/Header.tsx
- [x] T026 [P] [US5] Create Footer with copyright in src/components/Footer.tsx
- [x] T027 [US5] Create root layout with Header/Footer in src/app/layout.tsx
- [x] T028 [US5] Setup global styles with light theme in src/app/globals.css

### Game Components (US1 + US5)

- [x] T029 [P] [US1] Create Cell component with highlight states in src/components/Cell.tsx
- [x] T030 [P] [US1] Create NumberPad component (1-9 buttons) in src/components/NumberPad.tsx
- [x] T031 [P] [US1] Create Timer component with pause support in src/components/Timer.tsx
- [x] T032 [US1] Create SudokuBoard component (9x9 grid) in src/components/SudokuBoard.tsx
- [x] T033 [US1] Implement cell selection and highlighting logic in src/components/SudokuBoard.tsx
- [x] T034 [US1] Implement note mode (small numbers) in Cell and SudokuBoard

### Game State Management (US1)

- [x] T035 [US1] Create useTimer hook in src/hooks/useTimer.ts
- [x] T036 [US1] Create useGame hook with reducer in src/hooks/useGame.ts
- [x] T037 [US1] Create GameContext provider in src/contexts/GameContext.tsx

### Pages (US1)

- [x] T038 [US1] Create home page with mode selection in src/app/page.tsx
- [x] T039 [US1] Create practice page with difficulty selector in src/app/practice/page.tsx
- [x] T040 [US1] Implement pause overlay with resume button in src/app/practice/page.tsx
- [x] T041 [US1] Implement victory modal with time display in src/app/practice/page.tsx
- [x] T042 [US1] Add real-time conflict highlighting (red cells) in src/components/SudokuBoard.tsx

### Mobile Responsiveness (US5)

- [x] T043 [US5] Add responsive styles for board scaling on mobile in src/components/SudokuBoard.tsx
- [x] T044 [US5] Add touch-optimized NumberPad for mobile in src/components/NumberPad.tsx
- [x] T045 [US5] Add subtle animations with Framer Motion in src/components/Cell.tsx

**Checkpoint**: Practice mode fully functional - can play Sudoku offline without multiplayer

---

## Phase 4: User Story 2 - Create Room as Host (Priority: P2)

**Goal**: Host can create a multiplayer room and see room code

**Independent Test**: Create room → Get room code → See waiting room with player list

### API Endpoints (US2)

- [x] T046 [P] [US2] Create guest session endpoint POST /api/player/session in src/app/api/player/session/route.ts
- [x] T047 [P] [US2] Create room endpoint POST /api/rooms in src/app/api/rooms/route.ts
- [x] T048 [P] [US2] Get room endpoint GET /api/rooms/[code] in src/app/api/rooms/[code]/route.ts
- [x] T049 [US2] Start game endpoint POST /api/rooms/[code]/start in src/app/api/rooms/[code]/start/route.ts

### Socket Events (US2)

- [x] T050 [US2] Implement join_room socket event in src/server/socket.ts
- [x] T051 [US2] Implement leave_room socket event in src/server/socket.ts
- [x] T052 [US2] Implement start_game socket event in src/server/socket.ts
- [x] T053 [US2] Emit room_updated, player_joined events in src/server/socket.ts

### Components (US2)

- [x] T054 [P] [US2] Create NameInput component for guest name in src/components/NameInput.tsx
- [x] T055 [P] [US2] Create PlayerList component in src/components/PlayerList.tsx
- [x] T056 [US2] Create CreateRoomForm with difficulty selector in src/components/CreateRoomForm.tsx

### Hooks (US2)

- [x] T057 [US2] Create useSocket hook for connection management in src/hooks/useSocket.ts

### Pages (US2)

- [x] T058 [US2] Add "Create Room" section to home page in src/app/page.tsx
- [x] T059 [US2] Create room page with waiting room UI in src/app/room/[code]/page.tsx
- [x] T060 [US2] Implement host controls (Start button) in src/app/room/[code]/page.tsx

**Checkpoint**: Can create room, see room code, wait for players

---

## Phase 5: User Story 3 - Join Room (Priority: P2)

**Goal**: Players can join existing room and mark ready

**Independent Test**: Enter room code → Join room → See other players → Click ready → Host sees ready status

### API Endpoints (US3)

- [x] T061 [P] [US3] Join room endpoint POST /api/rooms/[code]/join in src/app/api/rooms/[code]/join/route.ts
- [x] T062 [P] [US3] Leave room endpoint POST /api/rooms/[code]/leave in src/app/api/rooms/[code]/leave/route.ts

### Socket Events (US3)

- [x] T063 [US3] Implement set_ready socket event in src/server/socket.ts
- [x] T064 [US3] Emit player_ready, player_left events in src/server/socket.ts

### Components (US3)

- [x] T065 [US3] Create JoinRoomForm with code input in src/components/JoinRoomForm.tsx
- [x] T066 [US3] Add Ready button to PlayerList in src/components/PlayerList.tsx

### Pages (US3)

- [x] T067 [US3] Add "Join Room" section to home page in src/app/page.tsx
- [x] T068 [US3] Implement player view (ready button) in room page in src/app/room/[code]/page.tsx
- [x] T069 [US3] Handle room full error in src/app/room/[code]/page.tsx

**Checkpoint**: Multiple players can join and ready up - host can start game

---

## Phase 6: User Story 4 - Competition (Priority: P3)

**Goal**: Real-time multiplayer competition with progress tracking and winner

**Independent Test**: Start game → See all players' progress → Complete puzzle → Winner announced

### API Endpoints (US4)

- [x] T070 [P] [US4] Progress update endpoint POST /api/games/[roomCode]/progress in src/app/api/games/[roomCode]/progress/route.ts
- [x] T071 [P] [US4] Validate cell endpoint POST /api/games/[roomCode]/validate in src/app/api/games/[roomCode]/validate/route.ts
- [x] T072 [P] [US4] Complete game endpoint POST /api/games/[roomCode]/complete in src/app/api/games/[roomCode]/complete/route.ts
- [x] T073 [P] [US4] Get results endpoint GET /api/games/[roomCode]/results in src/app/api/games/[roomCode]/results/route.ts
- [x] T074 [US4] Give up endpoint POST /api/games/[roomCode]/give-up in src/app/api/games/[roomCode]/give-up/route.ts

### Socket Events (US4)

- [x] T075 [US4] Implement cell_update socket event in src/server/socket.ts
- [x] T076 [US4] Implement complete_puzzle socket event in src/server/socket.ts
- [x] T077 [US4] Implement give_up socket event in src/server/socket.ts
- [x] T078 [US4] Emit progress_update, player_completed, game_ended events in src/server/socket.ts
- [x] T079 [US4] Implement winner determination (time + errors tiebreaker) in src/server/socket.ts

### Components (US4)

- [x] T080 [US4] Create Leaderboard component with progress bars in src/components/Leaderboard.tsx
- [x] T081 [US4] Add progress display to PlayerList in src/components/PlayerList.tsx

### Pages (US4)

- [x] T082 [US4] Implement multiplayer game view in src/app/room/[code]/page.tsx
- [x] T083 [US4] Show real-time leaderboard during game in src/app/room/[code]/page.tsx
- [x] T084 [US4] Implement results modal with rankings in src/app/room/[code]/page.tsx
- [x] T085 [US4] Handle player disconnect/reconnect UI in src/app/room/[code]/page.tsx

### Edge Cases (US4)

- [x] T086 [US4] Implement 30s host disconnect timeout in src/server/socket.ts
- [x] T087 [US4] Handle simultaneous completion (fewer errors wins) in src/server/socket.ts
- [x] T088 [US4] Auto-assign new host when host leaves waiting room in src/server/socket.ts

**Checkpoint**: Full multiplayer experience - compete, track progress, determine winner

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Authentication pages, profile, and refinements

### Auth Pages

- [x] T089 [P] Create login page in src/app/login/page.tsx
- [x] T090 [P] Create register page in src/app/register/page.tsx
- [x] T091 [P] Create LoginForm component in src/components/LoginForm.tsx
- [x] T092 [P] Create RegisterForm component in src/components/RegisterForm.tsx

### Auth API

- [x] T093 [P] Register endpoint POST /api/auth/register in src/app/api/auth/register/route.ts
- [x] T094 [P] Login endpoint POST /api/auth/login in src/app/api/auth/login/route.ts (via NextAuth)
- [x] T095 [P] Logout endpoint POST /api/auth/logout in src/app/api/auth/logout/route.ts
- [x] T096 [P] Get current user GET /api/auth/me in src/app/api/auth/me/route.ts

### Profile & History

- [x] T097 Create profile page in src/app/profile/page.tsx
- [x] T098 [P] Create ProfileCard component in src/components/ProfileCard.tsx
- [x] T099 [P] Create StatsCard component in src/components/StatsCard.tsx
- [x] T100 [P] Create RecentGamesCard component in src/components/RecentGamesCard.tsx
- [x] T101 [P] Profile endpoint GET /api/player/profile in src/app/api/player/profile/route.ts
- [x] T102 [P] History endpoint GET /api/player/history in src/app/api/player/history/route.ts

### Save Game History

- [x] T103 Create GameHistory model in src/models/GameHistory.ts (integrated in User model)
- [ ] T104 Save practice game results for logged-in users in src/app/practice/page.tsx
- [ ] T105 Save solo game results for logged-in users in src/app/room/[code]/page.tsx

### Final Polish

- [ ] T106 Add error boundaries and error pages
- [ ] T107 Add loading states with skeleton components
- [x] T108 Performance optimization (React.memo, useMemo where needed)
- [ ] T109 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
┌───────────────────────────────────────────┐
│ Phase 3 (US1+US5) → MVP Release possible  │
│ Phase 4 (US2) ─┐                          │
│ Phase 5 (US3) ─┼→ Can run in parallel     │
│ Phase 6 (US4) ─┘   after Phase 3          │
└───────────────────────────────────────────┘
    ↓
Phase 7 (Polish)
```

### User Story Dependencies

| Story        | Depends On                    | Can Parallel With |
| ------------ | ----------------------------- | ----------------- |
| US1+US5 (P1) | Phase 2 only                  | None (MVP first)  |
| US2 (P2)     | Phase 2, US1+US5 components   | US3               |
| US3 (P2)     | Phase 2, US2 (room creation)  | US4               |
| US4 (P3)     | US2, US3 (need rooms working) | Polish tasks      |

### Parallel Opportunities Per Phase

**Phase 1**: T003, T004, T005, T006, T007 all parallel

**Phase 2**: T009, T010, T011, T014 parallel after T008

**Phase 3**: T020-T026 parallel, T029-T031 parallel

**Phase 4**: T046-T048, T054-T055 parallel

**Phase 5**: T061-T062 parallel

**Phase 6**: T070-T074 parallel

**Phase 7**: Most tasks parallel (T089-T102)

---

## Parallel Example: Phase 3 Launch

```bash
# Launch all base UI components together:
T020: Create Button in src/components/ui/button.tsx
T021: Create Card in src/components/ui/card.tsx
T022: Create Input in src/components/ui/input.tsx
T023: Create Dialog in src/components/ui/dialog.tsx
T024: Create Select in src/components/ui/select.tsx

# After base UI, launch layout + game components together:
T025: Create Header in src/components/Header.tsx
T026: Create Footer in src/components/Footer.tsx
T029: Create Cell in src/components/Cell.tsx
T030: Create NumberPad in src/components/NumberPad.tsx
T031: Create Timer in src/components/Timer.tsx
```

---

## Implementation Strategy

### MVP First (Phase 1-3 Only)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (~2 hours)
3. Complete Phase 3: US1+US5 Practice Mode (~4 hours)
4. **STOP and VALIDATE**: Full single-player Sudoku working
5. Deploy MVP - users can play Practice mode

### Incremental Delivery

| Milestone | Stories | Value Delivered                    |
| --------- | ------- | ---------------------------------- |
| MVP       | US1+US5 | Single-player Sudoku with great UI |
| v1.1      | +US2    | Can create multiplayer rooms       |
| v1.2      | +US3    | Can join rooms, ready up           |
| v1.3      | +US4    | Full competition with winner       |
| v1.4      | +Polish | Auth, profiles, history            |

### Estimated Time

| Phase         | Tasks   | Est. Time     |
| ------------- | ------- | ------------- |
| Setup         | 7       | 30 min        |
| Foundational  | 12      | 2 hours       |
| US1+US5 (MVP) | 26      | 4 hours       |
| US2           | 15      | 2 hours       |
| US3           | 9       | 1.5 hours     |
| US4           | 19      | 3 hours       |
| Polish        | 21      | 3 hours       |
| **Total**     | **109** | **~16 hours** |

---

## Notes

- [P] = Can run in parallel (different files)
- [US#] = Maps to user story for traceability
- MVP achievable with Phase 1-3 only (~6.5 hours)
- Socket.io events must match contracts/socket-events.md
- API endpoints must match contracts/api.yaml
- All models must match data-model.md schemas
