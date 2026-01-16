"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default function HomePage() {
  const { player } = usePlayer();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [activeGame, setActiveGame] = useState<"sudoku" | "caro" | null>(null);

  const handleCreateRoom = (game: "sudoku" | "caro") => {
    setActiveGame(game);
    setShowCreateRoom(true);
  };

  const handleJoinRoom = (game: "sudoku" | "caro") => {
    setActiveGame(game);
    setShowJoinRoom(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Retro Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border-2 border-cyan-400/50 bg-cyan-400/10 px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
            <span className="text-sm text-cyan-300 font-mono uppercase tracking-wider">
              {player ? `Player: ${player.name}` : "Insert Coin to Start"}
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(180deg, #fff 0%, #00ffff 50%, #ff00ff 100%)',
                textShadow: '0 0 40px rgba(0, 255, 255, 0.5), 0 0 80px rgba(255, 0, 255, 0.3)',
                WebkitTextStroke: '1px rgba(255,255,255,0.3)'
              }}
            >
              SOLO GAMES
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto font-mono">
            ▸ Thi đấu realtime với bạn bè ◂
            <br />
            <span className="text-cyan-400">2 TRÒ CHƠI KINH ĐIỂN</span>
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sudoku Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <div
              className="relative border-4 border-cyan-400 bg-[#0d1117] p-1 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-cyan-400" />

              <div className="bg-gradient-to-b from-cyan-900/30 to-transparent p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">🧩</span>
                  <div className="flex items-center gap-2 border border-green-400 bg-green-400/10 px-3 py-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]"></span>
                    <span className="text-xs font-mono text-green-400 uppercase">Online</span>
                  </div>
                </div>

                <h2
                  className="text-4xl font-black text-white mb-2 tracking-wide"
                  style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}
                >
                  SUDOKU
                </h2>
                <p className="text-cyan-300/80 font-mono text-sm mb-6">
                  ▸ Ai điền số nhanh hơn, chiến thắng!
                </p>

                {/* Stats */}
                <div className="space-y-3 mb-6 font-mono text-sm">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-cyan-400">►</span>
                    <span>2-4 PLAYERS</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-cyan-400">►</span>
                    <span>3 DIFFICULTY LEVELS</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-cyan-400">►</span>
                    <span>REALTIME SYNC</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                    onClick={() => handleCreateRoom("sudoku")}
                  >
                    ▸ TẠO PHÒNG
                  </button>
                  <button
                    className="w-full py-3 px-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold uppercase tracking-wider transition-all duration-200"
                    onClick={() => handleJoinRoom("sudoku")}
                  >
                    ▸ THAM GIA PHÒNG
                  </button>
                  <button
                    className="w-full py-2 px-4 text-gray-500 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors"
                    onClick={() => window.location.href = '/practice'}
                  >
                    [ LUYỆN TẬP ]
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Caro Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group"
          >
            <div
              className="relative border-4 border-pink-500 bg-[#0d1117] p-1 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,255,0.4)]"
              style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
            >
              {/* Corner Accent */}
              <div className="absolute top-0 left-0 w-0 h-0 border-r-[20px] border-r-transparent border-t-[20px] border-t-pink-500" />

              <div className="bg-gradient-to-b from-pink-900/30 to-transparent p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">❌⭕</span>
                  <div className="flex items-center gap-2 border border-green-400 bg-green-400/10 px-3 py-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]"></span>
                    <span className="text-xs font-mono text-green-400 uppercase">Online</span>
                  </div>
                </div>

                <h2
                  className="text-4xl font-black text-white mb-2 tracking-wide"
                  style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}
                >
                  CỜ CARO
                </h2>
                <p className="text-pink-300/80 font-mono text-sm mb-6">
                  ▸ 5 ô liên tiếp để chiến thắng!
                </p>

                {/* Stats */}
                <div className="space-y-3 mb-6 font-mono text-sm">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-pink-400">►</span>
                    <span>2 PLAYERS (X vs O)</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-pink-400">►</span>
                    <span>15×15 BOARD</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-pink-400">►</span>
                    <span>5 MIN PER TURN</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full py-3 px-4 bg-pink-500 hover:bg-pink-400 text-black font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]"
                    onClick={() => handleCreateRoom("caro")}
                  >
                    ▸ TẠO PHÒNG
                  </button>
                  <button
                    className="w-full py-3 px-4 border-2 border-pink-500 text-pink-400 hover:bg-pink-500/10 font-bold uppercase tracking-wider transition-all duration-200"
                    onClick={() => handleJoinRoom("caro")}
                  >
                    ▸ THAM GIA PHÒNG
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-6 font-mono text-sm">
            {[
              { icon: "⚡", label: "REALTIME" },
              { icon: "👥", label: "MULTIPLAYER" },
              { icon: "🌐", label: "NO DOWNLOAD" },
              { icon: "🎮", label: "FREE PLAY" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors cursor-default"
              >
                <span>{feature.icon}</span>
                <span className="uppercase tracking-wider">{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-gray-600 font-mono text-xs">
            © 2026 SOLO GAMES • MADE WITH 💜
          </div>
        </motion.div>
      </div>

      {/* Dialogs */}
      <Dialog open={showCreateRoom} onClose={() => setShowCreateRoom(false)}>
        <DialogHeader>
          <DialogTitle>
            {activeGame === "sudoku" ? "🧩 TẠO PHÒNG SUDOKU" : "❌⭕ TẠO PHÒNG CARO"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <CreateRoomForm onCancel={() => setShowCreateRoom(false)} gameType={activeGame || "sudoku"} />
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinRoom} onClose={() => setShowJoinRoom(false)}>
        <DialogHeader>
          <DialogTitle>
            {activeGame === "sudoku" ? "🧩 THAM GIA PHÒNG SUDOKU" : "❌⭕ THAM GIA PHÒNG CARO"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <JoinRoomForm onCancel={() => setShowJoinRoom(false)} gameType={activeGame || "sudoku"} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
