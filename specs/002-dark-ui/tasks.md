# Tasks: Dark UI Theme

**Input**: Design documents from `/specs/002-dark-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable dark mode infrastructure

- [ ] T001 Create ThemeProvider component in src/lib/theme-provider.tsx
- [ ] T002 Update layout.tsx to wrap app with ThemeProvider (defaultTheme="dark") in src/app/layout.tsx
- [ ] T003 Add suppressHydrationWarning to html element in src/app/layout.tsx

**Checkpoint**: Dark mode infrastructure ready

---

## Phase 2: User Story 1 - Dark Theme Foundation (Priority: P1) MVP

**Goal**: All screens display with dark background and light text with sufficient contrast

**Independent Test**: Load any page and verify dark backgrounds with visible text/elements

### Implementation for User Story 1

- [ ] T004 [US1] Refine dark theme CSS variables for better contrast in src/app/globals.css
- [ ] T005 [P] [US1] Update --background to deeper dark color (e.g., 222 47% 8%) in src/app/globals.css
- [ ] T006 [P] [US1] Update --card colors for better visibility in src/app/globals.css
- [ ] T007 [US1] Update Sudoku grid cell colors for dark theme in src/app/globals.css
- [ ] T008 [US1] Verify main page displays correctly with dark theme in src/app/page.tsx
- [ ] T009 [P] [US1] Verify practice page displays correctly in src/app/practice/page.tsx
- [ ] T010 [P] [US1] Verify room page displays correctly in src/app/room/[code]/page.tsx

**Checkpoint**: All pages render with consistent dark theme

---

## Phase 3: User Story 2 - Simple Clean Interface (Priority: P1)

**Goal**: Uncluttered interface with adequate spacing and clear visual hierarchy

**Independent Test**: Users can identify game elements and controls immediately

### Implementation for User Story 2

- [ ] T011 [US2] Review and simplify SudokuBoard styling in src/components/SudokuBoard.tsx
- [ ] T012 [P] [US2] Review NumberPad for minimal, clean button styling in src/components/NumberPad.tsx
- [ ] T013 [P] [US2] Ensure adequate spacing in PlayerList component in src/components/PlayerList.tsx
- [ ] T014 [P] [US2] Review Leaderboard for clean layout in src/components/Leaderboard.tsx
- [ ] T015 [US2] Verify form components (JoinRoomForm, CreateRoomForm) have clean styling

**Checkpoint**: Interface is clean, uncluttered, and intuitive

---

## Phase 4: User Story 3 - Visual Feedback (Priority: P2)

**Goal**: Clear visual feedback for all user interactions

**Independent Test**: Interact with cells and controls, verify visible feedback for each action

### Implementation for User Story 3

- [ ] T016 [US3] Refine Cell component selected/highlighted states in src/components/Cell.tsx
- [ ] T017 [US3] Add subtle transition animations to cell states in src/components/Cell.tsx
- [ ] T018 [P] [US3] Add hover/active states to NumberPad buttons in src/components/NumberPad.tsx
- [ ] T019 [P] [US3] Add focus states for accessibility in src/components/ui/button.tsx
- [ ] T020 [US3] Ensure conflict cells are clearly distinguishable in dark mode in src/components/Cell.tsx

**Checkpoint**: All interactions provide clear visual feedback

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements across all components

- [ ] T021 Test on mobile viewport sizes (320px - 768px)
- [ ] T022 Test on desktop viewport sizes (768px - 1920px)
- [ ] T023 Verify contrast ratios meet WCAG AA (4.5:1) for all text
- [ ] T024 Run npm run lint to check for any issues
- [ ] T025 Visual review of complete dark theme across all screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **User Story 1 (Phase 2)**: Depends on Setup - dark theme foundation
- **User Story 2 (Phase 3)**: Can run parallel to US1 after Setup
- **User Story 3 (Phase 4)**: Can run parallel after Setup, integrates with US1/US2
- **Polish (Phase 5)**: Depends on all user stories complete

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel.

**Phase 2 parallel group**:
- T005, T006 (CSS variable updates in same file - do sequentially)
- T009, T010 (different page files - parallel)

**Phase 3 parallel group**:
- T012, T013, T014 (different component files - parallel)

**Phase 4 parallel group**:
- T018, T019 (different component files - parallel)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: User Story 1 (T004-T010)
3. **STOP and VALIDATE**: Verify dark theme displays correctly
4. Demo/review with stakeholders

### Full Implementation

1. Setup → US1 (dark foundation) → US2 (clean interface) → US3 (feedback) → Polish
2. Each phase builds on previous, maintaining working state throughout

---

## Notes

- Project already has dark CSS variables and next-themes installed
- Most shadcn/ui components auto-support dark mode via CSS variables
- Focus is on enabling dark by default and refining colors/contrast
- No backend changes required - UI only feature
