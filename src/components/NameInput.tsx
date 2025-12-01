"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { User, Loader2 } from "lucide-react";

export function NameInput() {
  const { player, isLoading, initSession } = usePlayer();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.length < 2 || name.length > 20) {
      setError("Name must be 2-20 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await initSession(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save name");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (player) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {player.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{player.displayName}</p>
                <p className="text-sm text-muted-foreground">Ready to play</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Enter Your Name
        </CardTitle>
        <CardDescription>
          Choose a display name for the game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || name.length < 2}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
