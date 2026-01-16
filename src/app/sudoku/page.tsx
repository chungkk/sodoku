"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { usePlayer } from "@/contexts/PlayerContext";

export default function SudokuLobbyPage() {
    const router = useRouter();
    const { player } = usePlayer();
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);

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
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

            <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-16">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 border-2 border-cyan-400/50 bg-cyan-400/10 px-4 py-2 mb-6">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
                        <span className="text-sm text-cyan-300 font-mono uppercase tracking-wider">
                            {player ? `Player: ${player.name}` : "Online Multiplayer"}
                        </span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
                        <span
                            className="text-transparent bg-clip-text"
                            style={{
                                backgroundImage: 'linear-gradient(180deg, #fff 0%, #00ffff 100%)',
                                textShadow: '0 0 40px rgba(0, 255, 255, 0.5)'
                            }}
                        >
                            🧩 SUDOKU
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-xl mx-auto font-mono">
                        ▸ Ai điền số nhanh hơn, người đó chiến thắng! ◂
                    </p>
                </motion.div>

                {/* Main Actions */}
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                    {/* Create Room */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <button
                            onClick={() => setShowCreateRoom(true)}
                            className="w-full group border-2 border-cyan-400 bg-[#0d1117] p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:bg-cyan-400/10"
                        >
                            <div className="text-4xl mb-4">🚀</div>
                            <h2
                                className="text-2xl font-black text-white mb-2 font-mono uppercase tracking-wide"
                                style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}
                            >
                                TẠO PHÒNG
                            </h2>
                            <p className="text-gray-400 font-mono text-sm">
                                Tạo phòng mới và mời bạn bè
                            </p>
                        </button>
                    </motion.div>

                    {/* Join Room */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <button
                            onClick={() => setShowJoinRoom(true)}
                            className="w-full group border-2 border-cyan-400/50 bg-[#0d1117] p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:border-cyan-400"
                        >
                            <div className="text-4xl mb-4">🔗</div>
                            <h2
                                className="text-2xl font-black text-white mb-2 font-mono uppercase tracking-wide"
                            >
                                THAM GIA PHÒNG
                            </h2>
                            <p className="text-gray-400 font-mono text-sm">
                                Nhập mã phòng để tham gia
                            </p>
                        </button>
                    </motion.div>
                </div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="border border-cyan-400/30 bg-cyan-400/5 p-6 max-w-2xl mx-auto"
                >
                    <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider mb-4">► GAME INFO</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl mb-1">👥</div>
                            <p className="text-white font-mono text-sm">2-4 Players</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-1">⚡</div>
                            <p className="text-white font-mono text-sm">Realtime</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-1">🎯</div>
                            <p className="text-white font-mono text-sm">3 Difficulty</p>
                        </div>
                    </div>
                </motion.div>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8"
                >
                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-500 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors"
                    >
                        [ ← BACK TO HOME ]
                    </button>
                </motion.div>
            </div>

            {/* Dialogs */}
            <Dialog open={showCreateRoom} onClose={() => setShowCreateRoom(false)}>
                <DialogHeader>
                    <DialogTitle>🧩 TẠO PHÒNG SUDOKU</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <CreateRoomForm onCancel={() => setShowCreateRoom(false)} gameType="sudoku" />
                </DialogContent>
            </Dialog>

            <Dialog open={showJoinRoom} onClose={() => setShowJoinRoom(false)}>
                <DialogHeader>
                    <DialogTitle>🧩 THAM GIA PHÒNG SUDOKU</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <JoinRoomForm onCancel={() => setShowJoinRoom(false)} gameType="sudoku" />
                </DialogContent>
            </Dialog>
        </div>
    );
}
