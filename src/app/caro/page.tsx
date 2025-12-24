"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";

interface RoomSuggestion {
  code: string;
  status: string;
  playerCount: number;
  createdAt: string;
}

export default function CaroLobbyPage() {
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  const [roomCode, setRoomCode] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch("/api/caro");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.code.toLowerCase().includes(roomCode.toLowerCase())
  );

  const handleSelectRoom = (code: string) => {
    setRoomCode(code);
    setShowSuggestions(false);
  };

  const handleCreateRoom = async () => {
    if (!player) {
      setShowNameInput(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/caro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          name: player.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/caro/${data.room.code}`);
      } else {
        const data = await res.json();
        setError(data.error || "Không thể tạo phòng");
      }
    } catch (err) {
      console.error("Failed to create room:", err);
      setError("Lỗi khi tạo phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!player) {
      setShowNameInput(true);
      return;
    }

    if (!roomCode.trim()) {
      setError("Vui lòng nhập mã phòng");
      return;
    }

    const code = roomCode.trim().toUpperCase();
    router.push(`/caro/${code}`);
  };

  const handleGuestSubmit = (name: string) => {
    setGuestName(name);
    setShowNameInput(false);
    setGuestNameInput(name);
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
          ❌⭕ Cờ Caro Online
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Chơi cờ caro online với bạn bè. Đánh 5 ô liên tiếp để chiến thắng!
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="elevated" className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Tạo phòng mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Tạo phòng chơi mới và mời bạn bè vào. Bạn sẽ là chủ phòng và có thể
                bắt đầu game khi cả hai người sẵn sàng.
              </p>

              <Button 
                onClick={handleCreateRoom} 
                fullWidth 
                size="lg"
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "🎮 Tạo phòng"}
              </Button>
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
                <span className="text-2xl">🔗</span>
                Tham gia phòng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Đã có mã phòng từ bạn bè? Nhập mã phòng vào ô dưới đây để tham gia
                và bắt đầu thi đấu.
              </p>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    label="Mã phòng"
                    placeholder="Nhập mã phòng (VD: ABC123)"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setError(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      fetchRooms();
                      setShowSuggestions(true);
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                    disabled={loading}
                    autoComplete="off"
                  />
                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                    >
                      {loadingRooms ? (
                        <div className="p-3 text-gray-500 text-sm text-center">
                          Đang tải...
                        </div>
                      ) : filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => (
                          <button
                            key={room.code}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => handleSelectRoom(room.code)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {room.code}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
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
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(room.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-sm text-center">
                          {roomCode
                            ? "Không tìm thấy phòng"
                            : "Chưa có phòng nào"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleJoinRoom}
                  disabled={loading || !roomCode.trim()}
                  variant="outline" 
                  fullWidth
                >
                  Tham gia phòng
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
        <Card padding="lg" className="bg-gradient-to-r from-orange-50 to-amber-50">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Luật chơi Cờ Caro
          </h3>
          <div className="text-gray-600 max-w-2xl mx-auto space-y-2">
            <p>• Bàn cờ 15x15 ô vuông</p>
            <p>• Hai người chơi lần lượt đánh dấu X hoặc O vào các ô trống</p>
            <p>• Người đầu tiên có 5 ô liên tiếp (ngang, dọc hoặc chéo) sẽ chiến thắng</p>
            <p>• Nếu bàn cờ đầy mà không ai thắng thì trận đấu hòa</p>
          </div>
        </Card>
      </motion.div>

      <Dialog open={showNameInput} onClose={() => setShowNameInput(false)}>
        <DialogHeader>
          <DialogTitle>Nhập tên của bạn</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <NameInput
            onSubmit={handleGuestSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
