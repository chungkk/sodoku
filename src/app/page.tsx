"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { usePlayer } from "@/contexts/PlayerContext";
import { Input } from "@/components/ui/input";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions = [
  { value: "easy", label: "🟢 Dễ" },
  { value: "medium", label: "🟡 Trung bình" },
  { value: "hard", label: "🔴 Khó" },
];

export default function HomePage() {
  const { player, setGuestName } = usePlayer();
  const [guestNameInput, setGuestNameInput] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showNameInput, setShowNameInput] = useState(false);

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
          🧩 Sudoku Online
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Rèn luyện tư duy logic với trò chơi Sudoku kinh điển.
          Chơi một mình hoặc thi đấu cùng bạn bè!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
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
                Thi đấu Solo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Tạo phòng và mời bạn bè cùng thi đấu. Ai hoàn thành nhanh nhất sẽ
                là người chiến thắng!
              </p>

              <div className="space-y-3">
                <Button variant="outline" fullWidth size="lg" disabled>
                  🚀 Tạo phòng
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">Sắp ra mắt</span>
                </Button>
                <Button variant="ghost" fullWidth disabled>
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
    </div>
  );
}
