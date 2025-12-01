"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSocket } from "@/hooks/useSocket";
import { useTimer } from "@/hooks/useTimer";
import { useGame } from "@/hooks/useGame";
import { PlayerList } from "@/components/PlayerList";
import { SudokuBoard } from "@/components/SudokuBoard";
import { NumberPad } from "@/components/NumberPad";
import { Timer } from "@/components/Timer";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Loader2, Play, LogOut, Flag, RotateCcw } from "lucide-react";

interface PlayerResult {
  playerId: string;
  sessionId: string;
  displayName: string;
  status: "completed" | "gave_up" | "in_progress";
  completionTime: number | null;
  mistakesCount: number;
  rank: number | null;
}

interface Player {
  id: string;
  displayName: string;
  isReady: boolean;
  isConnected: boolean;
}

interface RoomData {
  code: string;
  hostPlayerId: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  settings: {
    difficulty: string;
    maxPlayers: number;
  };
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { player } = usePlayer();
  const { socket, isConnected } = useSocket({
    sessionId: player?.sessionId || null,
    autoConnect: !!player,
  });

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gameData, setGameData] = useState<{
    puzzle: string;
    startTime: number;
  } | null>(null);
  const [gameResults, setGameResults] = useState<PlayerResult[] | null>(null);

  const isHost = room?.hostPlayerId === player?.sessionId;
  const isPlaying = room?.status === "playing" && gameData !== null;
  const isFinished = room?.status === "finished" || gameResults !== null;

  const fetchRoom = useCallback(async () => {
    if (!player) return;

    try {
      const response = await fetch(`/api/rooms/${code}`, {
        headers: { "X-Session-ID": player.sessionId },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Room not found");
      }

      const data = await response.json();
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setIsLoading(false);
    }
  }, [code, player]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!socket || !isConnected || !room || !player) return;

    socket.emit("room:join", { roomCode: code, displayName: player.displayName });

    socket.on("room:player-joined", ({ player: newPlayer }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const exists = prev.players.some((p) => p.id === newPlayer.id);
        if (exists) return prev;
        return { ...prev, players: [...prev.players, newPlayer] };
      });
    });

    socket.on("room:player-left", ({ playerId, newHostId }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter((p) => p.id !== playerId),
          hostPlayerId: newHostId || prev.hostPlayerId,
        };
      });
    });

    socket.on("room:player-ready", ({ playerId, isReady: ready }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, isReady: ready } : p
          ),
        };
      });
    });

    socket.on("room:player-disconnected", ({ playerId }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, isConnected: false } : p
          ),
        };
      });
    });

    socket.on("room:player-reconnected", ({ playerId }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, isConnected: true } : p
          ),
        };
      });
    });

    socket.on("game:starting", ({ countdown }) => {
      console.log("Game starting in", countdown);
    });

    socket.on("game:started", ({ puzzle, startTime }) => {
      setGameData({ puzzle, startTime });
      setRoom((prev) => prev ? { ...prev, status: "playing" } : prev);
    });

    socket.on("game:time-sync", ({ gameElapsed }) => {
      console.log("Time sync:", gameElapsed);
    });

    socket.on("game:player-completed", ({ playerId, displayName, completionTime, rank }) => {
      console.log(`${displayName} completed in ${completionTime}ms, rank ${rank}`);
    });

    socket.on("game:player-gave-up", ({ playerId, displayName }) => {
      console.log(`${displayName} gave up`);
    });

    socket.on("game:finished", ({ results }) => {
      setGameResults(results);
      setRoom((prev) => prev ? { ...prev, status: "finished" } : prev);
    });

    return () => {
      socket.off("room:player-joined");
      socket.off("room:player-left");
      socket.off("room:player-ready");
      socket.off("room:player-disconnected");
      socket.off("room:player-reconnected");
      socket.off("game:starting");
      socket.off("game:started");
      socket.off("game:time-sync");
      socket.off("game:player-completed");
      socket.off("game:player-gave-up");
      socket.off("game:finished");
    };
  }, [socket, isConnected, room, code, player]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    if (!socket) return;
    const newReady = !isReady;
    setIsReady(newReady);
    socket.emit("room:ready", { roomCode: code, isReady: newReady });
  };

  const handleStartGame = async () => {
    if (!socket || !isHost || !player) return;

    try {
      const response = await fetch(`/api/rooms/${code}/start`, {
        method: "POST",
        headers: { "X-Session-ID": player.sessionId },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start game");
      }

      const data = await response.json();
      socket.emit("game:started", {
        roomCode: code,
        puzzle: data.puzzle,
        startTime: data.startTime,
      });
    } catch (err) {
      console.error("Start game error:", err);
    }
  };

  const handleLeaveRoom = async () => {
    if (!player) return;

    try {
      await fetch(`/api/rooms/${code}/leave`, {
        method: "POST",
        headers: { "X-Session-ID": player.sessionId },
      });

      socket?.emit("room:leave", { roomCode: code });
      router.push("/");
    } catch (err) {
      console.error("Failed to leave room:", err);
    }
  };

  const handlePlayAgain = () => {
    setGameData(null);
    setGameResults(null);
    setIsReady(false);
    setRoom((prev) => prev ? { ...prev, status: "waiting" } : prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || "Room not found"}</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canStart = room.players.length >= 2 && room.players.every((p) => p.isReady || p.id === room.hostPlayerId);

  if (isFinished && gameResults && player) {
    return (
      <ResultsView
        results={gameResults}
        sessionId={player.sessionId}
        isHost={isHost}
        onPlayAgain={handlePlayAgain}
        onLeave={handleLeaveRoom}
      />
    );
  }

  if (isPlaying && gameData && player && socket) {
    return (
      <GameView
        roomCode={code}
        puzzle={gameData.puzzle}
        startTime={gameData.startTime}
        sessionId={player.sessionId}
        players={room.players}
        socket={socket}
        onLeave={handleLeaveRoom}
        onGameFinished={(results) => {
          setGameResults(results);
          setRoom((prev) => prev ? { ...prev, status: "finished" } : prev);
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Room Lobby</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleLeaveRoom}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Room Code</p>
                  <p className="text-3xl font-mono font-bold tracking-widest">{room.code}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize">Difficulty: {room.settings.difficulty}</span>
                <span>|</span>
                <span>Max Players: {room.settings.maxPlayers}</span>
              </div>

              <PlayerList
                players={room.players}
                hostId={room.hostPlayerId}
                currentPlayerId={player?.sessionId}
              />

              <div className="flex gap-4">
                {!isHost && (
                  <Button
                    onClick={handleToggleReady}
                    variant={isReady ? "secondary" : "default"}
                    className="flex-1"
                  >
                    {isReady ? "Not Ready" : "Ready"}
                  </Button>
                )}

                {isHost && (
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                    {!canStart && room.players.length < 2 && " (Need 2+ players)"}
                  </Button>
                )}
              </div>

              {isHost && !canStart && room.players.length >= 2 && (
                <p className="text-sm text-center text-muted-foreground">
                  Waiting for all players to be ready...
                </p>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Share the room code with friends to let them join!
          </p>
        </div>
      </div>
    </main>
  );
}

interface GameViewProps {
  roomCode: string;
  puzzle: string;
  startTime: number;
  sessionId: string;
  players: Player[];
  socket: ReturnType<typeof useSocket>["socket"];
  onLeave: () => void;
  onGameFinished: (results: PlayerResult[]) => void;
}

function GameView({ roomCode, puzzle, startTime, sessionId, players, socket, onLeave, onGameFinished }: GameViewProps) {
  const [myStatus, setMyStatus] = useState<"playing" | "completed" | "gave_up">("playing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { elapsedMs } = useTimer({ startTime, isRunning: myStatus === "playing" });
  const {
    board,
    initialGrid,
    selectedCell,
    conflicts,
    mistakesCount,
    selectCell,
    inputNumber,
    clearCell,
    isComplete,
  } = useGame({ initialBoard: puzzle, sessionId, roomCode });

  const handleComplete = async () => {
    if (isSubmitting || !isComplete) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/games/${roomCode}/complete`, {
        method: "POST",
        headers: { "X-Session-ID": sessionId },
      });

      if (response.ok) {
        const data = await response.json();
        setMyStatus("completed");
        socket?.emit("game:player-completed", {
          roomCode,
          completionTime: data.completionTime,
          rank: data.rank,
        });

        if (data.allFinished) {
          const resultsRes = await fetch(`/api/games/${roomCode}/results`, {
            headers: { "X-Session-ID": sessionId },
          });
          if (resultsRes.ok) {
            const resultsData = await resultsRes.json();
            socket?.emit("game:finished", { roomCode, results: resultsData.results });
            onGameFinished(resultsData.results);
          }
        }
      }
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGiveUp = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/games/${roomCode}/give-up`, {
        method: "POST",
        headers: { "X-Session-ID": sessionId },
      });

      if (response.ok) {
        const data = await response.json();
        setMyStatus("gave_up");
        socket?.emit("game:player-gave-up", { roomCode });

        if (data.allFinished) {
          const resultsRes = await fetch(`/api/games/${roomCode}/results`, {
            headers: { "X-Session-ID": sessionId },
          });
          if (resultsRes.ok) {
            const resultsData = await resultsRes.json();
            socket?.emit("game:finished", { roomCode, results: resultsData.results });
            onGameFinished(resultsData.results);
          }
        }
      }
    } catch (err) {
      console.error("Give up error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isComplete && myStatus === "playing") {
      handleComplete();
    }
  }, [isComplete]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full max-w-md">
              <Timer elapsedMs={elapsedMs} />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Mistakes:</span>
                <span className="font-bold text-destructive">{mistakesCount}</span>
              </div>
            </div>

            <SudokuBoard
              board={board}
              initialBoard={initialGrid}
              selectedCell={selectedCell}
              conflicts={conflicts}
              onCellClick={selectCell}
              onNumberInput={inputNumber}
              onClear={clearCell}
            />

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <NumberPad
                onNumberClick={inputNumber}
                onClear={clearCell}
                disabled={!selectedCell || myStatus !== "playing"}
                className="flex-1"
              />
            </div>

            {myStatus === "completed" && (
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-2xl font-bold text-green-500 mb-2">
                    Puzzle Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    Time: {Math.floor(elapsedMs / 1000 / 60)}:{(Math.floor(elapsedMs / 1000) % 60).toString().padStart(2, "0")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Waiting for other players...
                  </p>
                </CardContent>
              </Card>
            )}

            {myStatus === "gave_up" && (
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-bold text-muted-foreground mb-2">
                    You gave up
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Waiting for other players...
                  </p>
                </CardContent>
              </Card>
            )}

            {myStatus === "playing" && (
              <Button variant="outline" onClick={handleGiveUp} disabled={isSubmitting} className="mt-4">
                <Flag className="w-4 h-4 mr-2" />
                {isSubmitting ? "..." : "Give Up"}
              </Button>
            )}
          </div>

          <Card className="w-full lg:w-64">
            <CardHeader>
              <CardTitle className="text-lg">Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className={p.isConnected ? "" : "text-muted-foreground"}>
                      {p.displayName}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

interface ResultsViewProps {
  results: PlayerResult[];
  sessionId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

function ResultsView({ results, sessionId, isHost, onPlayAgain, onLeave }: ResultsViewProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center">Game Over!</h1>
          
          <Leaderboard results={results} currentSessionId={sessionId} />

          <div className="flex gap-4 justify-center">
            {isHost && (
              <Button onClick={onPlayAgain} className="flex-1 max-w-48">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            )}
            <Button variant="outline" onClick={onLeave} className="flex-1 max-w-48">
              <LogOut className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </div>

          {!isHost && (
            <p className="text-center text-sm text-muted-foreground">
              Waiting for host to start a new game...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
