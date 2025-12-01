"use client";

import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { NameInput } from "@/components/NameInput";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Trophy } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { player } = usePlayer();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sudoku
          </h1>
          <p className="text-xl text-muted-foreground">
            Chơi một mình hoặc cạnh tranh với bạn bè
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <NameInput />

          {player && (
            <>
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Gamepad2 className="w-6 h-6" />
                    Chế độ Luyện tập
                  </CardTitle>
                  <CardDescription>
                    Tự giải puzzle, ghi điểm dựa trên thời gian hoàn thành
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => router.push("/practice")}
                    className="w-full max-w-xs"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Chơi ngay
                  </Button>
                </CardContent>
              </Card>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc
                  </span>
                </div>
              </div>

              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Users className="w-6 h-6" />
                    Chế độ Đấu trường
                  </CardTitle>
                  <CardDescription>
                    Cạnh tranh với bạn bè - Ai thắng được điểm!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <CreateRoomForm />
                    <JoinRoomForm />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Tạo phòng và chia sẻ mã với bạn bè, hoặc tham gia phòng có sẵn.</p>
            <p className="mt-1">Từ 2 người trở lên là có thể bắt đầu chơi!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
