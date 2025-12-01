# Tasks: Dark UI Theme

**Input**: Design documents from `/specs/002-dark-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable dark mode infrastructure

- [x] T001 ThemeProvider already exists in src/lib/theme-provider.tsx
- [x] T002 layout.tsx already wraps app with ThemeProvider (defaultTheme="dark") in src/app/layout.tsx
- [x] T003 suppressHydrationWarning already on html element in src/app/layout.tsx

**Checkpoint**: Dark mode infrastructure ready - COMPLETED

---

## Phase 2: User Story 1 - Dark Theme Foundation (Priority: P1) MVP

**Goal**: All screens display with dark background and light text with sufficient contrast

**Independent Test**: Load any page and verify dark backgrounds with visible text/elements

### Implementation for User Story 1

- [x] T004 [US1] Refined dark theme CSS variables for better contrast in src/app/globals.css
- [x] T005 [US1] Updated --background to deeper dark (220 15% 6%) in src/app/globals.css
- [x] T006 [US1] Added --header-bg, --footer-bg, --section-bg variables in src/app/globals.css
- [x] T007 [US1] Updated cell colors for dark theme in src/app/globals.css
- [x] T008 [US1] Updated main page with dark sections in src/app/page.tsx
- [x] T009 [P] [US1] Verify practice page displays correctly in src/app/practice/page.tsx
- [x] T010 [P] [US1] Verify room page displays correctly in src/app/room/[code]/page.tsx

**Checkpoint**: Core dark theme applied - main page complete

---

## Phase 3: User Story 2 - Simple Clean Interface (Priority: P1)

**Goal**: Uncluttered interface with adequate spacing and clear visual hierarchy

**Independent Test**: Users can identify game elements and controls immediately

### Implementation for User Story 2

- [x] T011 [US2] Simplified Header component with distinct dark background in src/components/Header.tsx
- [x] T012 [US2] Simplified Footer component with distinct styling in src/components/Footer.tsx
- [x] T013 [US2] Simplified main page layout with clear section divisions in src/app/page.tsx
- [x] T014 [US2] Added Arena toggle - show create/join room only on click in src/app/page.tsx
- [x] T015 [P] [US2] Review SudokuBoard styling for simplicity in src/components/SudokuBoard.tsx
- [x] T016 [P] [US2] Review NumberPad for minimal styling in src/components/NumberPad.tsx
- [x] T017 [P] [US2] Review PlayerList spacing in src/components/PlayerList.tsx

**Checkpoint**: Interface simplified with clear sections

---

## Phase 4: User Story 3 - Visual Feedback (Priority: P2)

**Goal**: Clear visual feedback for all user interactions

**Independent Test**: Interact with cells and controls, verify visible feedback for each action

### Implementation for User Story 3

- [x] T018 [US3] Refine Cell component selected/highlighted states in src/components/Cell.tsx
- [x] T019 [US3] Add subtle transition animations to cell states in src/components/Cell.tsx
- [x] T020 [P] [US3] Add hover/active states to NumberPad buttons in src/components/NumberPad.tsx
- [x] T021 [P] [US3] Verify button focus states in src/components/ui/button.tsx
- [x] T022 [US3] Ensure conflict cells clearly visible in dark mode in src/components/Cell.tsx

**Checkpoint**: All interactions provide clear visual feedback

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements across all components

- [x] T023 Test on mobile viewport sizes (320px - 768px)
- [x] T024 Test on desktop viewport sizes (768px - 1920px)
- [x] T025 Verify contrast ratios meet WCAG AA (4.5:1) for all text
- [x] T026 Run npm run build - passed successfully
- [x] T027 Visual review of complete dark theme across all screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: COMPLETED
- **User Story 1 (Phase 2)**: Mostly complete - verify other pages
- **User Story 2 (Phase 3)**: Header/Footer/Page done - review game components
- **User Story 3 (Phase 4)**: Pending - cell interactions and feedback
- **Polish (Phase 5)**: After all user stories complete

### Parallel Opportunities

**Remaining Phase 2 parallel**:
- T009, T010 (different page files - parallel)

**Phase 3 parallel group**:
- T015, T016, T017 (different component files - parallel)

**Phase 4 parallel group**:
- T020, T021 (different component files - parallel)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ~~Complete Phase 1: Setup~~ DONE
2. ~~Complete Phase 2: User Story 1~~ MOSTLY DONE
3. **VALIDATE**: Verify dark theme displays correctly on practice/room pages
4. Demo/review with stakeholders

### Current Progress

- **Phase 1**: 100% Complete (3/3 tasks)
- **Phase 2**: 100% Complete (7/7 tasks)
- **Phase 3**: 100% Complete (7/7 tasks)
- **Phase 4**: 100% Complete (5/5 tasks)
- **Phase 5**: 100% Complete (5/5 tasks)

---

## Completed Changes Summary

1. **globals.css**: Dark theme variables optimized (background, header, footer, section colors)
2. **Header.tsx**: Simplified, distinct dark background (`hsl(220,15%,4%)`)
3. **Footer.tsx**: Simplified to single line, distinct background (`hsl(220,15%,8%)`)
4. **page.tsx**: Clean layout with clear sections, Arena toggle functionality

---

## Notes

- Project already has dark CSS variables and next-themes installed
- Most shadcn/ui components auto-support dark mode via CSS variables
- Focus is on enabling dark by default and refining colors/contrast
- No backend changes required - UI only feature
- Build passes successfully
