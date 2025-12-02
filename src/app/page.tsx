"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { NameInput } from "@/components/NameInput";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, ChevronDown, ChevronUp, Zap, Target, Grid3X3 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { player } = usePlayer();
  const [showArena, setShowArena] = useState(false);

  return (
    <div className="min-h-full flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary mb-4">
            <Zap className="w-4 h-4" />
            <span>Trò chơi giải đố số kinh điển</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            <span className="gradient-text">Sudoku</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Rèn luyện tư duy logic với trò chơi giải đố huyền thoại
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 pb-8">
        {/* Player section */}
        <section className="bg-card border border-border rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Tên người chơi</h2>
              <p className="text-sm text-muted-foreground">Nhập tên để bắt đầu</p>
            </div>
          </div>
          <NameInput />
        </section>

        {player && (
          <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Practice Mode */}
            <section className="bg-card border border-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Luyện tập
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Chế độ chơi đơn • Không giới hạn thời gian
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-3">Độ khó:</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-full font-medium">Dễ</span>
                    <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">Trung bình</span>
                    <span className="text-xs px-3 py-1.5 bg-destructive/10 text-destructive rounded-full font-medium">Khó</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push("/practice")}
                  className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Bắt đầu chơi
                </Button>
              </div>
            </section>

            {/* Arena Mode */}
            <section className="bg-card border border-border rounded-xl p-5 shadow-lg">
              <button
                onClick={() => setShowArena(!showArena)}
                className="w-full flex items-start gap-4 mb-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      Đấu trường
                    </h2>
                    {showArena ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chế độ nhiều người • 2-4 người chơi
                  </p>
                </div>
              </button>
              
              {showArena ? (
                <div className="space-y-4 animate-fadeIn">
                  <CreateRoomForm />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-sm text-muted-foreground">hoặc</span>
                    </div>
                  </div>
                  <JoinRoomForm />
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nhấn để mở rộng
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Instructions */}
        <section className="mt-8 bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Cách chơi</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary shrink-0">1</span>
              <p className="text-sm text-muted-foreground">Điền số 1-9 vào mỗi hàng</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary shrink-0">2</span>
              <p className="text-sm text-muted-foreground">Điền số 1-9 vào mỗi cột</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary shrink-0">3</span>
              <p className="text-sm text-muted-foreground">Điền số 1-9 vào mỗi ô 3x3</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
