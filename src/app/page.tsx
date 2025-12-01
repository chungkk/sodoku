"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { NameInput } from "@/components/NameInput";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { player } = usePlayer();
  const [showArena, setShowArena] = useState(false);

  return (
    <div className="min-h-full flex flex-col items-center">
      {/* Hero - Classic Dark Retro */}
      <section className="w-full bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 text-center">
          <h1 className="font-pixel text-xl md:text-2xl text-primary mb-2">
            SUDOKU
          </h1>
          <p className="font-retro text-lg text-muted-foreground">
            Classic Number Puzzle
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Desktop: side-by-side layout */}
        {/* Mobile: stacked layout */}
        <div className="w-full">
          
          {/* Player section */}
          <section className="bg-card retro-border p-4 mb-6">
            <p className="font-retro text-base text-muted-foreground mb-3">
              PLAYER NAME
            </p>
            <NameInput />
          </section>

          {player && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Practice Mode */}
              <section className="bg-card retro-border p-4">
                <div className="mb-4">
                  <h2 className="font-retro text-2xl text-foreground mb-1">
                    PRACTICE
                  </h2>
                  <p className="font-retro text-base text-muted-foreground">
                    Single Player
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-muted p-3 retro-border-sm">
                    <p className="font-retro text-base text-muted-foreground mb-2">
                      DIFFICULTY:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="font-retro text-sm px-2 py-1 bg-accent/20 text-accent border border-accent/30">EASY</span>
                      <span className="font-retro text-sm px-2 py-1 bg-primary/20 text-primary border border-primary/30">NORMAL</span>
                      <span className="font-retro text-sm px-2 py-1 bg-destructive/20 text-destructive border border-destructive/30">HARD</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => router.push("/practice")}
                    className="w-full font-retro text-lg h-12 retro-btn border border-border bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    START GAME
                  </Button>
                </div>
              </section>

              {/* Arena Mode */}
              <section className="bg-card retro-border p-4">
                <button
                  onClick={() => setShowArena(!showArena)}
                  className="w-full text-left mb-4"
                >
                  <h2 className="font-retro text-2xl text-foreground mb-1">
                    ARENA {showArena ? "[-]" : "[+]"}
                  </h2>
                  <p className="font-retro text-base text-muted-foreground">
                    Multiplayer • 2-4 Players
                  </p>
                </button>
                
                {showArena ? (
                  <div className="space-y-4 animate-fadeIn">
                    <CreateRoomForm />
                    <div className="border-t border-border my-4" />
                    <JoinRoomForm />
                  </div>
                ) : (
                  <div className="bg-muted p-3 retro-border-sm">
                    <p className="font-retro text-base text-muted-foreground text-center">
                      Click to expand
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Instructions - Desktop only */}
          <section className="hidden md:block mt-8 bg-card retro-border p-4">
            <h3 className="font-retro text-xl text-foreground mb-3">HOW TO PLAY</h3>
            <div className="grid grid-cols-3 gap-4 font-retro text-base text-muted-foreground">
              <div>
                <span className="text-primary">1.</span> Fill each row with 1-9
              </div>
              <div>
                <span className="text-primary">2.</span> Fill each column with 1-9
              </div>
              <div>
                <span className="text-primary">3.</span> Fill each 3x3 box with 1-9
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
