# Implementation Plan: Dark UI Theme

**Branch**: `002-dark-ui` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-dark-ui/spec.md`

## Summary

Implement a dark, friendly, and simple UI for the Sudoku game. The project already has dark theme CSS variables and `next-themes` installed - this feature will enable dark mode by default and refine the visual design for better UX.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Next.js 14+, React 18, Tailwind CSS 4.x, shadcn/ui, next-themes
**Storage**: MongoDB (existing - not modified)
**Testing**: Manual testing (no automated tests configured)
**Target Platform**: Web (desktop and mobile browsers)
**Project Type**: Single Next.js application
**Performance Goals**: Smooth animations, instant visual feedback
**Constraints**: Must maintain WCAG AA contrast (4.5:1 minimum)
**Scale/Scope**: Existing multiplayer Sudoku application

## Constitution Check

- [x] No new dependencies required (next-themes already installed)
- [x] Uses existing project patterns (Tailwind CSS variables, shadcn/ui)
- [x] No architectural changes needed

## Project Structure

### Documentation (this feature)

```text
specs/002-dark-ui/
├── spec.md              # Feature specification
├── plan.md              # This file
├── tasks.md             # Implementation tasks
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (affected files)

```text
src/
├── app/
│   ├── globals.css          # Dark theme CSS variables (modify)
│   ├── layout.tsx           # Add ThemeProvider (modify)
│   ├── page.tsx             # Verify dark theme consistency
│   ├── practice/page.tsx    # Verify dark theme consistency
│   └── room/[code]/page.tsx # Verify dark theme consistency
├── components/
│   ├── SudokuBoard.tsx      # Verify/refine dark styling
│   ├── Cell.tsx             # Verify/refine cell colors
│   ├── NumberPad.tsx        # Verify/refine button styling
│   ├── Timer.tsx            # Verify dark theme
│   ├── PlayerList.tsx       # Verify dark theme
│   ├── Leaderboard.tsx      # Verify dark theme
│   └── ui/                  # shadcn components (already dark-ready)
└── lib/
    └── theme-provider.tsx   # New: next-themes wrapper component
```

## Key Implementation Details

### 1. Enable Dark Mode by Default

The project has `darkMode: "class"` in tailwind.config.ts and dark CSS variables in globals.css. Need to:
- Create ThemeProvider component using next-themes
- Wrap app in ThemeProvider with `defaultTheme="dark"`
- Add `dark` class to html element by default

### 2. Refine Dark Color Palette

Current dark theme variables exist but may need refinement for:
- Better contrast ratios
- More visually appealing cell colors
- Improved visual hierarchy

### 3. Component Updates

Most components use Tailwind CSS variables which auto-switch with dark mode. May need:
- Verify all components respect dark theme
- Add any missing dark-specific styles
- Ensure consistent visual feedback (hover, focus, selected states)

## Complexity Tracking

No violations - uses existing patterns and dependencies.
