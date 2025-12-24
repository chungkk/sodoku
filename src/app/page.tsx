"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { NameInput } from "@/components/NameInput";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions = [
  { value: "easy", label: "🟢 Dễ" },
  { value: "medium", label: "🟡 Trung bình" },
  { value: "hard", label: "🔴 Khó" },
];

interface CaroRoom {
  code: string;
  status: string;
  playerCount: number;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  const [guestNameInput, setGuestNameInput] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showNameInput, setShowNameInput] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  // Caro states
  const [caroRoomCode, setCaroRoomCode] = useState("");
  const [caroRooms, setCaroRooms] = useState<CaroRoom[]>([]);
  const [showCaroSuggestions, setShowCaroSuggestions] = useState(false);
  const [loadingCaroRooms, setLoadingCaroRooms] = useState(false);
  const [caroLoading, setCaroLoading] = useState(false);
  const [caroError, setCaroError] = useState<string | null>(null);
  const [showCaroNameInput, setShowCaroNameInput] = useState(false);
  const [caroAction, setCaroAction] = useState<"create" | "join" | null>(null);
  const caroInputRef = useRef<HTMLInputElement>(null);
  const caroSuggestionsRef = useRef<HTMLDivElement>(null);

  const fetchCaroRooms = async () => {
    setLoadingCaroRooms(true);
    try {
      const res = await fetch("/api/caro");
      if (res.ok) {
        const data = await res.json();
        setCaroRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to fetch caro rooms:", err);
    } finally {
      setLoadingCaroRooms(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        caroSuggestionsRef.current &&
        !caroSuggestionsRef.current.contains(e.target as Node) &&
        caroInputRef.current &&
        !caroInputRef.current.contains(e.target as Node)
      ) {
        setShowCaroSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCaroRooms = caroRooms.filter((room) =>
    room.code.toLowerCase().includes(caroRoomCode.toLowerCase())
  );

  const handleCreateCaroRoom = async () => {
    if (!player) {
      setCaroAction("create");
      setShowCaroNameInput(true);
      return;
    }
    setCaroLoading(true);
    setCaroError(null);
    try {
      const res = await fetch("/api/caro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: player.visitorId, name: player.name }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/caro/${data.room.code}`);
      } else {
        const data = await res.json();
        setCaroError(data.error || "Không thể tạo phòng");
      }
    } catch {
      setCaroError("Lỗi khi tạo phòng");
    } finally {
      setCaroLoading(false);
    }
  };

  const handleJoinCaroRoom = () => {
    if (!player) {
      setCaroAction("join");
      setShowCaroNameInput(true);
      return;
    }
    if (!caroRoomCode.trim()) {
      setCaroError("Vui lòng nhập mã phòng");
      return;
    }
    router.push(`/caro/${caroRoomCode.trim().toUpperCase()}`);
  };

  const handleCaroNameSubmit = (name: string) => {
    setGuestName(name);
    setShowCaroNameInput(false);
    if (caroAction === "create") {
      setTimeout(() => handleCreateCaroRoom(), 100);
    } else if (caroAction === "join" && caroRoomCode.trim()) {
      router.push(`/caro/${caroRoomCode.trim().toUpperCase()}`);
    }
  };

  const handleStartPractice = () => {
    if (!player) {
      setShowNameInput(true);
      return;
    }
    window.location.href = `/practice?difficulty=${difficulty}`;
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestNameInput.trim().length >= 2) {
      setGuestName(guestNameInput.trim());
      window.location.href = `/practice?difficulty=${difficulty}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          🧩 Solo Online
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Rèn luyện tư duy logic với trò chơi Sudoku kinh điển.
          Chơi một mình hoặc thi đấu cùng bạn bè!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="elevated" className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Tập luyện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Chơi Sudoku một mình với 3 mức độ khó. Hoàn hảo để luyện tập và
                cải thiện kỹ năng của bạn.
              </p>

              {showNameInput && !player ? (
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <Input
                    label="Tên của bạn"
                    placeholder="Nhập tên (ít nhất 2 ký tự)"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button type="submit" fullWidth disabled={guestNameInput.trim().length < 2}>
                      Bắt đầu chơi
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNameInput(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Select
                    label="Độ khó"
                    options={difficultyOptions}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  />
                  <Button onClick={handleStartPractice} fullWidth size="lg">
                    🎮 Bắt đầu chơi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card variant="elevated" className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Thi đấu Sudoku
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Tạo phòng và mời bạn bè cùng thi đấu. Ai hoàn thành nhanh nhất sẽ
                là người chiến thắng!
              </p>

              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  onClick={() => setShowCreateRoom(true)}
                >
                  🚀 Tạo phòng
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => setShowJoinRoom(true)}
                >
                  🔗 Tham gia phòng
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card variant="elevated" className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">❌⭕</span>
                Cờ Caro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Chơi cờ caro online với bạn bè. Đánh 5 ô liên tiếp để chiến thắng!
              </p>

              {caroError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {caroError}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  onClick={handleCreateCaroRoom}
                  disabled={caroLoading}
                >
                  {caroLoading ? "Đang tạo..." : "🚀 Tạo phòng"}
                </Button>
                
                <div className="relative">
                  <Input
                    ref={caroInputRef}
                    placeholder="Nhập mã phòng..."
                    value={caroRoomCode}
                    onChange={(e) => {
                      setCaroRoomCode(e.target.value.toUpperCase());
                      setCaroError(null);
                      setShowCaroSuggestions(true);
                    }}
                    onFocus={() => {
                      fetchCaroRooms();
                      setShowCaroSuggestions(true);
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinCaroRoom()}
                    autoComplete="off"
                  />
                  {showCaroSuggestions && (
                    <div
                      ref={caroSuggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                    >
                      {loadingCaroRooms ? (
                        <div className="p-3 text-gray-500 text-sm text-center">
                          Đang tải...
                        </div>
                      ) : filteredCaroRooms.length > 0 ? (
                        filteredCaroRooms.map((room) => (
                          <button
                            key={room.code}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => {
                              setCaroRoomCode(room.code);
                              setShowCaroSuggestions(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 text-sm">
                                {room.code}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  room.status === "waiting"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {room.status === "waiting"
                                  ? `Chờ (${room.playerCount}/2)`
                                  : "Đang chơi"}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-sm text-center">
                          {caroRoomCode ? "Không tìm thấy" : "Chưa có phòng"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={handleJoinCaroRoom}
                  disabled={!caroRoomCode.trim()}
                >
                  🔗 Tham gia phòng
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center"
      >
        <Card padding="lg" className="bg-gradient-to-r from-primary-50 to-blue-50">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cách chơi Sudoku
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Điền các số từ 1-9 vào bảng 9x9 sao cho mỗi hàng, mỗi cột và mỗi ô vuông 3x3
            đều chứa đủ các số từ 1 đến 9, không trùng lặp.
          </p>
        </Card>
      </motion.div>

      <Dialog open={showCreateRoom} onClose={() => setShowCreateRoom(false)}>
        <DialogHeader>
          <DialogTitle>Tạo phòng mới</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <CreateRoomForm onCancel={() => setShowCreateRoom(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinRoom} onClose={() => setShowJoinRoom(false)}>
        <DialogHeader>
          <DialogTitle>Tham gia phòng</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <JoinRoomForm onCancel={() => setShowJoinRoom(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCaroNameInput} onClose={() => setShowCaroNameInput(false)}>
        <DialogHeader>
          <DialogTitle>Nhập tên của bạn</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <NameInput onSubmit={handleCaroNameSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
