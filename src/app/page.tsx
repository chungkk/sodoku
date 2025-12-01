"use client";

import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { NameInput } from "@/components/NameInput";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Trophy, Zap, Clock, Target } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { player } = usePlayer();

  return (
    <div className="bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Multiplayer Sudoku
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Sudoku
            </h1>
            <p className="text-lg text-muted-foreground">
              Chơi một mình hoặc cạnh tranh với bạn bè trong thời gian thực
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Player Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <div className="w-8 h-px bg-border" />
              Người chơi
            </div>
            <NameInput />
          </section>

          {player && (
            <>
              {/* Game Modes Grid */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="w-8 h-px bg-border" />
                  Chế độ chơi
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Practice Mode */}
                  <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:border-primary/50 transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardHeader className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Gamepad2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Luyện tập</CardTitle>
                          <CardDescription>Solo Mode</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Tính thời gian</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span>Ghi điểm cá nhân</span>
                        </div>
                      </div>
                      <Button 
                        size="lg" 
                        onClick={() => router.push("/practice")}
                        className="w-full group-hover:shadow-lg group-hover:shadow-primary/25 transition-shadow"
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Chơi ngay
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Arena Mode */}
                  <Card className="relative overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent hover:border-accent/50 transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardHeader className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                          <Users className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Đấu trường</CardTitle>
                          <CardDescription>Multiplayer Mode</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>2-4 người chơi</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          <span>Realtime</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cạnh tranh với bạn bè - Ai giải nhanh hơn sẽ thắng!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Room Actions */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="w-8 h-px bg-border" />
                  Tạo hoặc tham gia phòng
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <CreateRoomForm />
                  <JoinRoomForm />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
