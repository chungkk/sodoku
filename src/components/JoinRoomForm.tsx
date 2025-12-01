"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { Users, Loader2 } from "lucide-react";

interface JoinRoomFormProps {
  onSuccess?: (roomCode: string) => void;
}

export function JoinRoomForm({ onSuccess }: JoinRoomFormProps) {
  const router = useRouter();
  const { player } = usePlayer();
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!player) {
      setError("Please enter your name first");
      return;
    }

    if (!roomCode || roomCode.length !== 6) {
      setError("Room code must be 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomCode.toUpperCase()}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": player.sessionId,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join room");
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      setRoomCode(value);
      setError(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Join Room
        </CardTitle>
        <CardDescription>
          Enter a room code to join your friends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Room Code</label>
          <Input
            placeholder="ABC123"
            value={roomCode}
            onChange={handleCodeChange}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono uppercase"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleJoin}
          disabled={isLoading || !player || roomCode.length !== 6}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Room"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
