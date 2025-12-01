# Feature Specification: Multiplayer Sudoku Game

**Feature Branch**: `001-multiplayer-sudoku`  
**Created**: 2025-12-01  
**Status**: Draft  
**Input**: User description: "Xây dựng trang Sudoku có thể chơi 2-4 người, mỗi người chơi độc lập, nhưng 4 người vào cùng phòng, ấn bắt đầu, 4 người cùng 1 map Sudoku, khi ấn bắt đầu 4 người cùng chơi cùng nhau, thời gian tính cho cả 4 cùng chạy. Để sau so sánh kết quả với nhau. Giao diện thân thiện, sáng, hiện đại."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Join Game Room (Priority: P1)

A player wants to create a new game room or join an existing room to play Sudoku with friends. The host creates a room and shares a room code with friends. Other players use this code to join. The room displays all connected players (2-4 players) and their ready status.

**Why this priority**: This is the foundation of multiplayer functionality. Without room creation/joining, no multiplayer game can happen.

**Independent Test**: Can be fully tested by creating a room, sharing code, having other players join, and verifying all players appear in the lobby.

**Acceptance Scenarios**:

1. **Given** a player is on the home page, **When** they click "Create Room", **Then** a new room is created with a unique shareable room code displayed prominently.
2. **Given** a player has a room code, **When** they enter the code and click "Join", **Then** they are added to the room and see other players in the lobby.
3. **Given** a room has fewer than 2 players, **When** the host tries to start the game, **Then** the system prevents starting and shows a message requiring at least 2 players.
4. **Given** a room already has 4 players, **When** another player tries to join, **Then** they see a message that the room is full.

---

### User Story 2 - Synchronized Sudoku Gameplay (Priority: P1)

When the host starts the game, all players in the room simultaneously receive the same Sudoku puzzle. Each player solves the puzzle independently on their own board. A shared timer starts counting for all players at the same moment. Players can see their own progress but cannot see other players' solutions.

**Why this priority**: This is the core gameplay mechanic that differentiates multiplayer Sudoku from single-player.

**Independent Test**: Can be tested by starting a game with multiple players and verifying all receive identical puzzles and the timer starts simultaneously.

**Acceptance Scenarios**:

1. **Given** a room has 2-4 players and all are ready, **When** the host clicks "Start Game", **Then** all players see the same Sudoku puzzle appear on their screens simultaneously.
2. **Given** the game has started, **When** a player enters a number in a cell, **Then** only that player sees their input (other players cannot see it).
3. **Given** the game is in progress, **When** any player looks at the timer, **Then** they see the same elapsed time as all other players.
4. **Given** a player enters an incorrect number, **When** they submit, **Then** they receive immediate feedback that the number is incorrect.

---

### User Story 3 - Complete Puzzle and Compare Results (Priority: P1)

When a player completes the Sudoku puzzle correctly, their completion time is recorded. Once all players finish (or give up), a results screen shows a leaderboard comparing all players' times, number of mistakes, and completion status.

**Why this priority**: The comparison and competition aspect is the main motivation for multiplayer play.

**Independent Test**: Can be tested by having players complete puzzles and verifying the results screen displays accurate rankings.

**Acceptance Scenarios**:

1. **Given** a player fills all cells correctly, **When** the puzzle is validated, **Then** their completion time is recorded and they see a "Completed!" message with their time.
2. **Given** some players have finished and others are still playing, **When** a finished player views the game, **Then** they can see their own result and a "Waiting for others..." status.
3. **Given** all players have finished or given up, **When** the game ends, **Then** all players see a results leaderboard showing: rank, player name, completion time (or "Did not finish"), and number of mistakes.
4. **Given** the results screen is displayed, **When** the host clicks "Play Again", **Then** all players return to the lobby with the same room, ready for a new game.

---

### User Story 4 - Modern and Friendly User Interface (Priority: P2)

The game interface is visually appealing with a bright, modern design. The Sudoku grid is clear and easy to read. Controls are intuitive with both click and keyboard input supported. The interface works well on both desktop and mobile devices.

**Why this priority**: Good UX enhances the gaming experience but is not strictly required for core functionality.

**Independent Test**: Can be tested through user feedback sessions and responsive design testing on various devices.

**Acceptance Scenarios**:

1. **Given** a player opens the game, **When** they view the interface, **Then** they see a clean, bright color scheme with clear visual hierarchy.
2. **Given** a player is solving the puzzle, **When** they select a cell, **Then** the selected cell is clearly highlighted along with related row, column, and 3x3 box.
3. **Given** a player is on a mobile device, **When** they interact with the game, **Then** all elements are appropriately sized and touch-friendly.
4. **Given** a player prefers keyboard input, **When** they use arrow keys and numbers, **Then** they can navigate and input without using a mouse.

---

### Edge Cases

- What happens when a player disconnects during gameplay? (System should mark them as "Disconnected" and allow others to continue)
- What happens when the host leaves? (System should transfer host role to another player or end the session gracefully)
- What happens if two players finish at the exact same millisecond? (Both should be ranked equally as tied)
- What happens if a player's internet connection is unstable? (System should attempt to reconnect and sync game state)
- What happens if a player closes their browser and returns? (They should be able to rejoin their active game using the same room code within a time limit)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow players to create a new game room with a unique, shareable room code
- **FR-002**: System MUST allow players to join an existing room using a room code
- **FR-003**: System MUST support 2 to 4 players per room (minimum 2 to start, maximum 4)
- **FR-004**: System MUST generate the same Sudoku puzzle for all players in a room when the game starts
- **FR-005**: System MUST synchronize the game start time so all players begin simultaneously
- **FR-006**: System MUST maintain a shared timer visible to all players showing elapsed time
- **FR-007**: System MUST keep each player's puzzle progress private from other players during gameplay
- **FR-008**: System MUST validate player inputs and provide immediate feedback on incorrect numbers
- **FR-009**: System MUST record completion time when a player successfully completes the puzzle
- **FR-010**: System MUST display a results leaderboard when all players finish showing rankings, times, and mistakes
- **FR-011**: System MUST allow players to give up and see their partial progress on the results screen
- **FR-012**: System MUST allow the host to start a new game with the same room after viewing results
- **FR-013**: System MUST display player connection status in the room lobby
- **FR-014**: System MUST provide a responsive design that works on both desktop and mobile devices
- **FR-015**: System MUST support both mouse/touch and keyboard input for gameplay

### Key Entities

- **Player**: Represents a user in the game. Has a display name, unique session identifier, connection status, and current game state.
- **Room**: A game session container. Has a unique room code, list of players (2-4), host player, room status (waiting/playing/finished), and game settings.
- **Puzzle**: The Sudoku puzzle instance. Contains the initial puzzle state, solution, difficulty level, and is shared across all players in a room.
- **Player Progress**: Individual player's game state. Contains their current board state, mistakes count, completion time, and completion status.
- **Game Results**: Final comparison data. Contains rankings, completion times, mistake counts, and winner determination.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can create a room and have friends join using a code in under 30 seconds
- **SC-002**: Game start is synchronized within 500 milliseconds across all connected players
- **SC-003**: Timer displays are synchronized within 1 second tolerance across all players
- **SC-004**: 95% of users can understand how to create/join a room without instructions
- **SC-005**: 90% of users rate the interface as "easy to use" and "visually appealing"
- **SC-006**: Game interface loads and is interactive within 3 seconds on standard internet connections
- **SC-007**: System supports at least 100 concurrent active rooms without performance degradation
- **SC-008**: Players can complete a full game session (join, play, view results) without encountering errors in 99% of sessions
- **SC-009**: Mobile users can comfortably play without zooming or horizontal scrolling

## Assumptions

- Players have modern web browsers with JavaScript enabled
- Players have stable internet connections suitable for real-time multiplayer
- Room codes will be shared out-of-band (via messaging apps, verbally, etc.)
- Standard Sudoku rules apply (9x9 grid, numbers 1-9, no duplicates in rows/columns/boxes)
- Default puzzle difficulty is medium; difficulty selection may be added as a future enhancement
- Player names are self-assigned and do not require account registration
