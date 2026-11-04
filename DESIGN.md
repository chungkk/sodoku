---
name: Solo Games
description: A striped candy box where friends drop candies into Sudoku and Caro trays, led by a candy-striped chameleon.
colors:
  cherry: "#d92c45"
  mascot-red: "#e8384f"
  cherry-pale: "#ffd9dd"
  teal: "#0b7f73"
  lemon: "#ffd24d"
  lemon-wash: "#ffe58a"
  lemon-pale: "#fff0bd"
  gum: "#ff9db0"
  mint: "#a9ecd8"
  mint-deep: "#8fe0c8"
  mint-pale: "#dcf7ee"
  ink: "#55303f"
  ink-soft: "#6f4a59"
  milk: "#fffaf3"
  sugar: "#fdeeda"
  field-white: "#ffffff"
typography:
  display:
    fontFamily: "Paytone One, Baloo 2, sans-serif"
    fontSize: "clamp(3.5rem, 18vw, 4.75rem)"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "Paytone One, Baloo 2, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "Paytone One, Baloo 2, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
  button-large:
    fontFamily: "Paytone One, Baloo 2, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
  button:
    fontFamily: "Paytone One, Baloo 2, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  label:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
  tool-label:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1
  board-digit:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "6.6cqw"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  pad-digit:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  field: "1rem"
  compartment: "1.25rem"
  board: "1.5rem"
  tray: "2rem"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.cherry}"
    textColor: "{colors.milk}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-primary-wrapped:
    backgroundColor: "{colors.cherry}"
    textColor: "{colors.milk}"
    typography: "{typography.button-large}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "64px"
  button-outline:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.lemon-pale}"
  tool-button:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.tool-label}"
    rounded: "{rounded.pill}"
    padding: "0 6px"
    height: "44px"
  tool-button-active:
    backgroundColor: "{colors.lemon}"
  chip:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 12px"
  tray:
    backgroundColor: "{colors.milk}"
    rounded: "{rounded.tray}"
  compartment:
    backgroundColor: "{colors.field-white}"
    rounded: "{rounded.compartment}"
    padding: "8px"
  input-field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
  speech-bubble:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compartment}"
    padding: "6px 12px"
  number-candy:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    typography: "{typography.pad-digit}"
    rounded: "{rounded.pill}"
    height: "52px"
  number-candy-active:
    backgroundColor: "{colors.lemon}"
  sudoku-candy:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.milk}"
    typography: "{typography.board-digit}"
  sudoku-candy-conflict:
    backgroundColor: "{colors.cherry}"
    textColor: "{colors.milk}"
---

# Design System: Solo Games

## Overview

**Creative North Star: "The Candy Box"**

The whole app is one striped candy box. A board is a tray with compartments, and every move drops a candy into one of them. A red and milk awning sits on top, the mint field runs edge to edge, and a chameleon on a branch tells the player the one thing to do next. It is cheerful, cute and physical, built for a phone held in one hand during a short break.

Density follows the game: lobbies are loose and friendly, while play screens give almost all their height to the board and pin the tools under the thumb. The material language is thick plum ink outlines, milk trays, and hard candy with soft shadows. Decoration never slows or covers play.

The system rejects the standard game app of white cards on a grey ground.

**Key Characteristics:**
- Mint dotted field across the full screen, no neutral grey anywhere
- Thick plum outlines (3 to 5px) on every tray, candy and control
- Soft shadows plus one streak of gloss as the only depth
- Springy drops as the signature motion, with reduced motion respected
- Teal for you, lemon for rivals, red for conflict during Sudoku versus
- One chameleon line per screen, in Vietnamese

## Colors

A saturated sweet-shop palette of red, teal, lemon and pink on mint, held together by one plum ink and a warm milk.

### Primary
- **Candy Cherry** (#d92c45): The UI red. Primary buttons, awning stripes, the title, X pieces, Sudoku conflict candies, field errors, and the Caro clock in its last 30 seconds. Milk text on it reaches 4.6:1.
- **Mascot Stripe Red** (#e8384f): Mascot art and the app icon only. Milk text on it reaches only 3.96:1, which is why it never carries UI text.
- **Conflict Blush** (#ffd9dd): Background of a Sudoku cell in conflict.

### Secondary
- **Bottle Teal** (#0b7f73): The player's own Sudoku candies and own progress bar, O pieces in Caro, and the active status chip in rooms. Milk text on it reaches 4.71:1.

### Tertiary
- **Lemon Drop** (#ffd24d): Selection and active state: selected cell, active number, active tab, active difficulty, notes mode. Also rival progress bars, room code candies, the Sudoku tile, and the winning Caro cells.
- **Lemon Wash** (#ffe58a): Sudoku cells holding the same number as the selection.
- **Lemon Cream** (#fff0bd): Hover on milk controls, the last Caro move, and the player's own row in lists.
- **Bubblegum** (#ff9db0): Caro tile, erase key, player initials, third rank.

### Neutral
- **Mint Field** (#a9ecd8): The page ground and browser theme colour.
- **Deep Mint** (#8fe0c8): The 26px dot pattern on the field and the scrollbar track.
- **Pale Mint** (#dcf7ee): Row, column and box highlight on the Sudoku board, Caro cells, and the tab track.
- **Plum Ink** (#55303f): All outlines, main text, given digits, box lines, focus outlines, and the dialog scrim at 65%.
- **Soft Plum** (#6f4a59): Secondary text, placeholders and pencil notes. Reaches 5.6:1 on mint and 7.2:1 on milk.
- **Milk** (#fffaf3): Trays, boards, speech bubbles, chips and text on red or teal.
- **Sugar** (#fdeeda): Alternating 3x3 boxes on the Sudoku board. CSS only, with no Tailwind colour.
- **Field White** (#ffffff): Inputs, player rows and stat cells that sit inside a milk tray.

### Named Rules
**The Two Reds Rule.** Two reds ship on purpose. Mascot art keeps Mascot Stripe Red; everything in the UI uses Candy Cherry so milk text passes contrast. Never swap one for the other to tidy the palette.

**The Whose Candy Rule.** On the Sudoku versus board and progress bars, teal means you, lemon means rivals, and red means only a conflict. This is scoped to that play surface: Candy Cherry stays the primary action colour elsewhere and is the X piece in Caro.

**The Ink Channel Rule.** Ink with alpha must go through the rgb channel token `--ink-rgb` (85 48 63), which is what makes Tailwind opacity modifiers work on `ink`. A hex custom property cannot take an alpha modifier.

## Typography

**Display Font:** Paytone One (with Baloo 2, sans-serif)
**Body Font:** Baloo 2 (with system-ui, sans-serif)

**Character:** A chunky, candy-shaped display face over a round, friendly body. Both load the `latin` and `vietnamese` subsets, so stacked diacritics stay inside the same voice.

### Hierarchy
- **Display** (400, clamp(3.5rem, 18vw, 4.75rem) on the phone and 5.75rem on desktop, line-height 1): The Solo Games title and lobby titles, in Candy Cherry with a thick milk stroke painted behind the fill (0.19em) and a soft drop shadow.
- **Headline** (400, 1.5rem, 1.25): Dialog titles, single-purpose screens and the paused board message.
- **Title** (400, 1.75rem, 1): Game names on the home tiles.
- **Button** (400, 1.5rem on large and 1.125rem on medium, 1): All button faces use the display font.
- **Body** (600, 1.125rem, 1.55): Dialog sentences and supporting copy. Baloo 2 is rarely set below semibold on this saturated ground.
- **Label** (700, 1rem, 1.25): Chips, player names and form labels, with 0.95rem on tool buttons and speech bubbles.
- **Board digit** (700, 6.6cqw, 1, tabular): Sudoku digits scale with the board's own width so they always fit the cell. Pencil notes use 3cqw at 600.
- **Pad digit** (800, 1.625rem, 1, tabular): Number keys, growing to 2.125rem on desktop.

### Named Rules
**The Readable Vào Rule.** A display face must have a Vietnamese subset and a V that cannot be read as U. Coiny was rejected because its V broke "Vào". Test any replacement on real Vietnamese UI words, not on the name of the app.

## Layout

Phone first and single column. The mint field fills the screen, and content sits in a narrow centred column: 28rem for single-purpose screens, 32rem for lobbies, and 72rem for the home grid, which becomes `1fr 31rem` with the mascot left and tray right at 1024px.

The spacing rhythm is tight and steps through 6, 8, 12, 16 and 20px. Compartments and controls sit close together, because the thick outlines already separate them.

The Sudoku stage is a full-height column on the phone with an 8px gap: mascot line, status chips and progress, board, then tools and number pad pushed to the bottom by an auto margin. Board width is `min(100%, 100dvh - 22.5rem)`, tightening to 21rem of reserved height at 720px tall or less, with a 17rem floor. At 1024px it becomes a two-column grid of the board and a 22rem tool rail. Caro follows the same idea with a 20rem rail from 768px.

Height is a first-class breakpoint: 600, 700, 720, 740 and 780px all change sizes, since a phone keyboard or browser chrome is the common constraint. On phone play screens the header, awning and footer are removed so the board gets the height.

**The Grid Truth Rule.** Lines and digits sit dead straight. Sudoku 3x3 box lines live on their own overlay layer so cell borders never cut them, and digits use tabular figures. Playfulness belongs to the candy, not the grid.

## Elevation & Depth

A hybrid of outline and soft shadow. The thick ink outline does the structural work, and a soft, negatively spread shadow lifts the tray or candy off the field. Hard candy adds one highlight. There is no shadow scale beyond the vocabulary below.

### Shadow Vocabulary
- **Tray lift** (`box-shadow: 0 14px 26px -14px rgba(85, 48, 63, 0.55)`): Trays, dialogs and the Sudoku board.
- **Candy lift** (`box-shadow: 0 10px 16px -10px rgba(85, 48, 63, 0.7)`): Glossed primary buttons, room code candies, and the countdown candy.
- **Title glow** (`filter: drop-shadow(0 6px 5px rgba(85, 48, 63, 0.35))`): The candy title only.

### Named Rules
**The One Streak Rule.** Depth is a soft shadow and a single streak of gloss in white at 65 to 70%. Never use hard offset shadows or rim bevels. This is a candy, not a sticker or a plastic key.

## Shapes

Everything is round. Corners step down as containers nest: trays at 2rem, boards at 1.5rem, compartments and speech bubbles at 1.25rem, fields and room code candies at 1rem, and pills or circles for every control and candy. Caro cells use a soft 30% radius.

Outline weight also steps with size: 5px on trays and boards, 4px on buttons, compartments and fields, 3px on chips and tool buttons, and 2.5px on progress bars. Empty slots use a dashed ink outline at 40 to 45% alpha. Icons are inline SVG with a 2.6 stroke and round caps, matching the outlines.

## Components

### Buttons
Tactile hard candy that lifts on hover and squashes on press.
- **Shape:** Full pill with a 4px ink outline.
- **Primary:** Candy Cherry with milk display text, candy lift and gloss. Heights are 40, 48 and 64px for small, medium and large.
- **Wrapped:** The same candy with two twisted wrapper ends in its own colour, placed in the 1.375rem margin it reserves on each side.
- **Hover / Focus:** Rises 2px and brightens by 10%; press scales to 0.96 and sinks 1px on a stiff spring (500/26). Focus shows the global 3px ink outline with a 2px offset. Disabled drops to 55% opacity and 50% saturation.
- **Outline:** Milk with ink text, Lemon Cream on hover, no gloss. Used for secondary and quitting actions.
- **Ghost:** Transparent with ink at 10% on hover, for "Hủy".
- **Tool button:** A 44px milk pill with a 3px outline, icon and label, sharing the row equally. The icon hides under 360px wide. Notes mode turns it lemon.

**The One Wrapper Rule.** The wrapped candy is reserved for the main action of a screen. If two candies seem to qualify, one of them is an outline button.

### Chips
- **Style:** Milk pill, 3px ink outline, bold text, tabular figures for numbers.
- **State:** Room status chips turn teal with milk text when active. The Caro clock turns cherry at 30 seconds or less.

### Cards / Containers
The tray is the main surface of every screen.
- **Corner Style:** 2rem, or 1.5rem when holding a board.
- **Background:** Milk.
- **Shadow Strategy:** Tray lift.
- **Border:** 5px ink.
- **Internal Padding:** 10 to 20px, tightening at short heights.
- **Compartments:** Inside a tray, 1.25rem corners and a 4px outline. Home tiles use lemon or gum and hold the game's real pieces. Player rows use Field White, or Lemon Cream for you.

### Inputs / Fields
- **Style:** Field White, 4px ink outline, 1rem corners, 1.25rem semibold text, soft plum placeholder. The room code field is centred display text at 1.875rem with 0.2em tracking.
- **Focus:** The caret is Candy Cherry.
- **Error / Disabled:** Outline and message turn Candy Cherry; disabled drops to 60%.

### Navigation
The home page has almost none: two tray compartments, a wrapped candy and one underlined text link. Inner pages carry the awning, a small still mascot with the name in display type, and an underlined "Luyện tập" link with a 3px decoration. A "Trang chủ" back link leads the lobby.

### Awning
A repeating 72px scalloped pattern of Candy Cherry and milk with ink outlines, 50px tall, flush with the top of the screen. It is the box's lid and is absent on phone play screens.

### Mascot
The source is shadow-new `public/mascot.svg`, with the headphones and sound-wave bars removed because they belong to a listening app. The chameleon wears round glasses and a pompom hat, and sits on a branch. Moods are `happy`, `cheer`, `think`, `sad`, `sleep` and `wow`. It breathes, sways, flicks its tail and blinks; `cheer` hops. In play, its pupils follow the selected cell, and on the home page they follow the pointer. A fresh Sudoku conflict makes it `wow` for 900ms.

**The One Line Rule.** Each screen has exactly one mascot line: an imperative or reaction in a milk speech bubble with an ink tail. A dialog is its own layer and may speak for itself, and status captions such as loading or paused labels are not lines.

**The Always There Rule.** At short heights the mascot gets smaller and never disappears, down to 40px wide beside the board at 720px tall or less.

### Sudoku Board
A tray of compartments: milk and Sugar in alternating 3x3 boxes, 1px ink hairlines at 22%, 3px ink box lines on their own layer, and 1.5rem corners. Cell priority is selected (Lemon Drop), then conflict (Conflict Blush), same number (Lemon Wash), highlight (Pale Mint) and box tint.

**The Given Ink Rule.** Given digits stay plain ink. Player digits are dropped candies, 84% of the cell, with an arc of gloss. The candy falls from above on a bouncy spring (620/17) and turns cherry on conflict. Conflict follows Sudoku rules only, never the answer, because versus clients do not hold the solution.

### Number Pad
Round milk keys with a 4px ink outline, five across on the phone and three across on desktop. They rise 2px on hover and squash to 0.9 on press; the active number is lemon and the erase key is gum. Height is 52px, or 64px and 76px when there is room, and 44px at 600px tall or less.

### Caro Pieces
**The Two Signals Rule.** X is a red candy with a milk cross and O is a teal candy with a milk ring, so pieces differ by shape as well as colour. Keep both signals in any new piece treatment. Pieces drop with a spring (560/15); the last move sits on Lemon Cream, and winning cells turn lemon with their candies bouncing.

### Candy Bar
A 12px milk pill with a 2.5px outline, filled with 135-degree candy stripes: teal for you, lemon for rivals. Width moves on a soft spring (170/24). Your bar is always listed first.

### Dialogs
A tray that rises from the bottom on the phone and centres from 640px, on spring 380/26 over a 65% ink scrim. Result dialogs carry the mood-matched mascot, a headline, one sentence and, on a win, the falling wrapper rain.

**The Honest Rematch Rule.** The versus result primary is the wrapped candy "Chơi ván mới", and it goes to the game's lobby, because the server cannot restart a finished room. Never label it as an instant rematch. Practice can start again in place, so its primary is "Chơi ván nữa".

## Do's and Don'ts

### Do:
- **Do** build every new screen as milk trays with ink outlines on the mint dotted field.
- **Do** use Candy Cherry for all UI red and keep Mascot Stripe Red inside mascot art.
- **Do** keep teal for you, lemon for rivals and red for conflict on the Sudoku versus board and progress bars.
- **Do** make Caro pieces differ by shape as well as colour.
- **Do** keep given digits plain ink and make player digits dropped candies.
- **Do** give each screen exactly one mascot line, and shrink the mascot rather than removing it at short heights.
- **Do** route ink alpha through `--ink-rgb`.
- **Do** test a new display face on Vietnamese words such as "Vào".
- **Do** pair bouncy springs with `MotionConfig reducedMotion="user"` and the reduced-motion CSS guard.

### Don't:
- **Don't** use hard offset shadows or rim bevels; depth is a soft shadow plus one streak of gloss.
- **Don't** put milk text on Mascot Stripe Red.
- **Don't** use red on the Sudoku versus board for anything except a conflict.
- **Don't** promise an instant rematch from a finished versus room; "Chơi ván mới" goes to the lobby.
- **Don't** bring back the mascot's headphones or sound-wave bars.
- **Don't** build white cards on a grey ground. Compartments live inside one tray and hold their game's real pieces.
