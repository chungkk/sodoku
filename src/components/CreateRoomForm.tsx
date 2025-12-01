"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { Plus, Loader2 } from "lucide-react";

interface CreateRoomFormProps {
  onSuccess?: (roomCode: string) => void;
}

export function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
  const router = useRouter();
  const { player } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const handleCreate = async () => {
    if (!player) {
      setError("Please enter your name first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": player.sessionId,
        },
        body: JSON.stringify({ difficulty, maxPlayers: 4 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create room");
      }

      const data = await response.json();
      
      if (onSuccess) {
        onSuccess(data.code);
      } else {
        router.push(`/room/${data.code}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Room
        </CardTitle>
        <CardDescription>
          Start a new game and invite friends with a room code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Difficulty</label>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficulty(d)}
                className="flex-1 capitalize"
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleCreate}
          disabled={isLoading || !player}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Room"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
