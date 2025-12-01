# Tasks: Multiplayer Sudoku Game

**Input**: Design documents from `/specs/001-multiplayer-sudoku/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Create Next.js project with TypeScript, Tailwind, App Router: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
- [ ] T002 Install core dependencies: `npm install mongoose socket.io socket.io-client sudoku uuid`
- [ ] T003 [P] Install shadcn/ui and add components: `npx shadcn-ui@latest init && npx shadcn-ui@latest add button card input dialog toast`
- [ ] T004 [P] Create environment configuration in `.env.local` with MONGODB_URI and NEXT_PUBLIC_SOCKET_URL
- [ ] T005 [P] Create TypeScript server config in `tsconfig.server.json` for custom server
- [ ] T006 Update `package.json` scripts for custom server dev/start commands

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create MongoDB connection utility in `src/lib/mongodb.ts`
- [ ] T008 [P] Create Player model in `src/models/Player.ts` (session-based, all stories need this)
- [ ] T009 [P] Create custom server entry point in `server.ts` with Socket.IO integration
- [ ] T010 Create Socket.IO server setup in `src/server/socket.ts` with connection handlers
- [ ] T011 Create Socket.IO client utility in `src/lib/socket.ts`
- [ ] T012 Create PlayerContext provider in `src/contexts/PlayerContext.tsx` for session management
- [ ] T013 Implement player session API endpoint in `src/app/api/player/session/route.ts`
- [ ] T014 Create base layout with PlayerContext in `src/app/layout.tsx`
- [ ] T015 [P] Create useSocket hook in `src/hooks/useSocket.ts` for socket connection management

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Join Game Room (Priority: P1) 🎯 MVP

**Goal**: Players can create rooms, share codes, and join rooms to see each other in a lobby

**Independent Test**: Create a room, copy code, open another browser, join with code, verify both players appear in lobby

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create Room model in `src/models/Room.ts` with code, players, host, status, settings
- [ ] T017 [P] [US1] Create room code generator utility in `src/lib/utils.ts` (6-char alphanumeric)
- [ ] T018 [US1] Implement create room API endpoint in `src/app/api/rooms/route.ts` (POST)
- [ ] T019 [US1] Implement get room API endpoint in `src/app/api/rooms/[code]/route.ts` (GET)
- [ ] T020 [US1] Implement join room API endpoint in `src/app/api/rooms/[code]/join/route.ts` (POST)
- [ ] T021 [US1] Implement leave room API endpoint in `src/app/api/rooms/[code]/leave/route.ts` (POST)
- [ ] T022 [US1] Add room socket events in `src/server/socket.ts`: room:join, room:leave, room:ready
- [ ] T023 [US1] Add room broadcast events in `src/server/socket.ts`: player-joined, player-left, player-ready
- [ ] T024 [P] [US1] Create PlayerList component in `src/components/PlayerList.tsx` showing players and ready status
- [ ] T025 [P] [US1] Create CreateRoomForm component in `src/components/CreateRoomForm.tsx`
- [ ] T026 [P] [US1] Create JoinRoomForm component in `src/components/JoinRoomForm.tsx`
- [ ] T027 [US1] Create home page in `src/app/page.tsx` with create/join room UI
- [ ] T028 [US1] Create room lobby page in `src/app/room/[code]/page.tsx` with PlayerList and ready toggle
- [ ] T029 [US1] Implement room state management in lobby page with socket events

**Checkpoint**: User Story 1 complete - players can create, join, and see each other in rooms

---

## Phase 4: User Story 2 - Synchronized Sudoku Gameplay (Priority: P1)

**Goal**: All players get same puzzle, timer syncs, each player solves independently with validation

**Independent Test**: Start game with 2+ players, verify same puzzle appears, timer shows same time, inputs are private

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create Puzzle model in `src/models/Puzzle.ts` with initialBoard, solution, difficulty
- [ ] T031 [P] [US2] Create PlayerProgress model in `src/models/PlayerProgress.ts` with board state, mistakes, status
- [ ] T032 [P] [US2] Create sudoku utility in `src/lib/sudoku.ts` wrapping sudoku package for generation/validation
- [ ] T033 [US2] Implement start game API endpoint in `src/app/api/rooms/[code]/start/route.ts`
- [ ] T034 [US2] Implement get progress API endpoint in `src/app/api/games/[roomCode]/progress/route.ts` (GET)
- [ ] T035 [US2] Implement update progress API endpoint in `src/app/api/games/[roomCode]/progress/route.ts` (PATCH)
- [ ] T036 [US2] Implement validate cell API endpoint in `src/app/api/games/[roomCode]/validate/route.ts`
- [ ] T037 [US2] Add game socket events in `src/server/socket.ts`: room:start, game:starting, game:started
- [ ] T038 [US2] Add timer sync socket event in `src/server/socket.ts`: game:time-sync (every 10s)
- [ ] T039 [P] [US2] Create Cell component in `src/components/Cell.tsx` with selection, highlighting, input
- [ ] T040 [P] [US2] Create SudokuBoard component in `src/components/SudokuBoard.tsx` rendering 9x9 grid
- [ ] T041 [P] [US2] Create NumberPad component in `src/components/NumberPad.tsx` for number input
- [ ] T042 [P] [US2] Create Timer component in `src/components/Timer.tsx` with server-synced display
- [ ] T043 [US2] Create useTimer hook in `src/hooks/useTimer.ts` with server time synchronization
- [ ] T044 [US2] Create useGame hook in `src/hooks/useGame.ts` for game state management
- [ ] T045 [US2] Create GameContext provider in `src/contexts/GameContext.tsx`
- [ ] T046 [US2] Integrate game UI in room page `src/app/room/[code]/page.tsx` with board, timer, numberpad
- [ ] T047 [US2] Implement keyboard navigation in SudokuBoard (arrow keys, number input)

**Checkpoint**: User Story 2 complete - synchronized gameplay works with validation and timer

---

## Phase 5: User Story 3 - Complete Puzzle and Compare Results (Priority: P1)

**Goal**: Players complete puzzle, times recorded, leaderboard shows rankings when all finish

**Independent Test**: Complete puzzle, verify time recorded, wait for others, see leaderboard with rankings

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create GameHistory model in `src/models/GameHistory.ts` for persistent game records
- [ ] T049 [US3] Implement complete puzzle API endpoint in `src/app/api/games/[roomCode]/complete/route.ts`
- [ ] T050 [US3] Implement give up API endpoint in `src/app/api/games/[roomCode]/give-up/route.ts`
- [ ] T051 [US3] Implement get results API endpoint in `src/app/api/games/[roomCode]/results/route.ts`
- [ ] T052 [US3] Add completion socket events in `src/server/socket.ts`: game:player-completed, game:player-gave-up
- [ ] T053 [US3] Add game finished socket event in `src/server/socket.ts`: game:finished with results
- [ ] T054 [P] [US3] Create Leaderboard component in `src/components/Leaderboard.tsx` showing rankings
- [ ] T055 [US3] Create results screen UI in room page with Leaderboard, play again button
- [ ] T056 [US3] Implement play again flow: return to lobby, host can start new game
- [ ] T057 [US3] Save game history to GameHistory collection when game ends

**Checkpoint**: User Story 3 complete - full game cycle works with results comparison

---

## Phase 6: User Story 4 - Modern and Friendly User Interface (Priority: P2)

**Goal**: Polished, responsive design with modern aesthetics and intuitive interactions

**Independent Test**: Test on desktop and mobile, verify responsive layout, smooth animations, clear visual feedback

### Implementation for User Story 4

- [ ] T058 [P] [US4] Design color scheme and CSS variables in `src/app/globals.css` (bright, modern theme)
- [ ] T059 [P] [US4] Create responsive layout styles for home page `src/app/page.tsx`
- [ ] T060 [P] [US4] Style room lobby with card layouts, player avatars in `src/app/room/[code]/page.tsx`
- [ ] T061 [US4] Enhance SudokuBoard styling with cell highlighting (row, column, 3x3 box)
- [ ] T062 [US4] Add visual feedback for correct/incorrect inputs (colors, animations)
- [ ] T063 [US4] Implement mobile-friendly number pad with touch optimization
- [ ] T064 [US4] Add loading states and skeleton screens for async operations
- [ ] T065 [US4] Add toast notifications for game events (player joined, game starting, etc.)
- [ ] T066 [US4] Ensure all components are touch-friendly with appropriate sizing
- [ ] T067 [US4] Add smooth transitions and animations for state changes

**Checkpoint**: User Story 4 complete - polished, responsive UI on all devices

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final refinements

- [ ] T068 [P] Implement player disconnect handling in `src/server/socket.ts` (mark disconnected, allow reconnect)
- [ ] T069 [P] Implement host transfer when host leaves in `src/server/socket.ts`
- [ ] T070 [P] Implement player reconnection flow with state recovery
- [ ] T071 Add error handling middleware for API routes
- [ ] T072 [P] Implement player profile API in `src/app/api/player/profile/route.ts`
- [ ] T073 [P] Implement player history API in `src/app/api/player/history/route.ts`
- [ ] T074 Add room cleanup (auto-delete inactive rooms after 24h via TTL index)
- [ ] T075 Final testing: run through quickstart.md validation scenarios
- [ ] T076 Performance check: verify <3s page load, <500ms game sync

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
┌───────────────────────────────────────────┐
│  User Stories can proceed in parallel     │
│  or sequentially by priority              │
├───────────────┬───────────────┬───────────┤
│ Phase 3: US1  │ Phase 4: US2  │ Phase 5:  │
│ (P1) Rooms    │ (P1) Gameplay │ US3 (P1)  │
│               │ (needs US1)   │ Results   │
│               │               │ (needs    │
│               │               │ US1+US2)  │
└───────────────┴───────────────┴───────────┘
    ↓
Phase 6: US4 (P2) - UI Polish (enhances all)
    ↓
Phase 7: Polish & Edge Cases
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 - Rooms | Foundational | Phase 2 complete |
| US2 - Gameplay | Foundational + US1 Room model | T016 complete (Room model) |
| US3 - Results | Foundational + US2 Progress model | T031 complete (PlayerProgress) |
| US4 - UI Polish | All US1-3 components exist | Phase 5 checkpoint |

### Within Each User Story

1. Models before APIs
2. APIs before socket events
3. Components before page integration
4. Core functionality before polish

### Parallel Opportunities

**Phase 1 - All [P] tasks parallel:**
- T003, T004, T005 can run simultaneously

**Phase 2 - Models parallel:**
- T008, T009, T015 can run simultaneously

**Phase 3 (US1) - Components parallel:**
- T024, T025, T026 can run simultaneously

**Phase 4 (US2) - Models and components parallel:**
- T030, T031, T032 can run simultaneously
- T039, T040, T041, T042 can run simultaneously

**Phase 5 (US3):**
- T048 can run parallel with other model work

**Phase 6 (US4) - Most styling parallel:**
- T058, T059, T060 can run simultaneously

---

## Parallel Example: User Story 2 Launch

```bash
# Launch all models for US2 together:
Task: "Create Puzzle model in src/models/Puzzle.ts"
Task: "Create PlayerProgress model in src/models/PlayerProgress.ts"
Task: "Create sudoku utility in src/lib/sudoku.ts"

# After models complete, launch all components together:
Task: "Create Cell component in src/components/Cell.tsx"
Task: "Create SudokuBoard component in src/components/SudokuBoard.tsx"
Task: "Create NumberPad component in src/components/NumberPad.tsx"
Task: "Create Timer component in src/components/Timer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (~2 hours)
3. Complete Phase 3: US1 - Room creation/joining (~3 hours)
4. **STOP and VALIDATE**: Test room creation and joining with multiple browsers
5. Demo: Players can create and join rooms

### Incremental Delivery

| Milestone | Stories | Demo Capability |
|-----------|---------|-----------------|
| MVP | Setup + Foundation + US1 | Create/join rooms, see lobby |
| Alpha | + US2 | Play synchronized Sudoku |
| Beta | + US3 | Complete games, see results |
| Release | + US4 + Polish | Polished, responsive experience |

### Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Setup | 6 | 30 min |
| Phase 2: Foundational | 9 | 2-3 hours |
| Phase 3: US1 Rooms | 14 | 3-4 hours |
| Phase 4: US2 Gameplay | 18 | 4-5 hours |
| Phase 5: US3 Results | 10 | 2-3 hours |
| Phase 6: US4 UI | 10 | 2-3 hours |
| Phase 7: Polish | 9 | 2-3 hours |
| **Total** | **76** | **~18-22 hours** |

---

## Notes

- Tasks marked [P] can run in parallel (different files, no blocking dependencies)
- [US#] label maps each task to its user story for traceability
- Commit after each task or logical group
- Test each user story independently before moving to next
- Room page (`src/app/room/[code]/page.tsx`) evolves across US1, US2, US3 - careful with merges
