"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { CaroBoard } from "@/components/CaroBoard";
import { createEmptyBoard, checkWinner, isBoardFull, isValidMove, type Board, type CellValue } from "@/lib/caro";
import { getBestMove } from "@/lib/caro-ai";

type GameStatus = "playing" | "finished";

export default function CaroBotPage() {
  const router = useRouter();
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentTurn, setCurrentTurn] = useState<CellValue>("X");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [winner, setWinner] = useState<CellValue>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [winningCells, setWinningCells] = useState<{ row: number; col: number }[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const playerSymbol: CellValue = "X";
  const botSymbol: CellValue = "O";

  const findWinningCells = useCallback((board: Board, row: number, col: number, player: CellValue) => {
    if (!player) return [];

    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dx, dy] of directions) {
      const cells: { row: number; col: number }[] = [{ row, col }];

      for (let i = 1; i < 5; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
        if (board[r][c] !== player) break;
        cells.push({ row: r, col: c });
      }

      for (let i = 1; i < 5; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
        if (board[r][c] !== player) break;
        cells.push({ row: r, col: c });
      }

      if (cells.length >= 5) return cells;
    }

    return [];
  }, []);

  const makeMove = useCallback((row: number, col: number, player: CellValue) => {
    if (!isValidMove(board, row, col) || !player) return false;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = player;
    setBoard(newBoard);
    setLastMove({ row, col });
    setCurrentTurn(player === "X" ? "O" : "X");

    if (checkWinner(newBoard, row, col, player)) {
      setWinner(player);
      setGameStatus("finished");
      setWinningCells(findWinningCells(newBoard, row, col, player));
      setShowResultModal(true);
      return true;
    }

    if (isBoardFull(newBoard)) {
      setGameStatus("finished");
      setShowResultModal(true);
      return true;
    }

    return true;
  }, [board, findWinningCells]);

  // Bot move
  useEffect(() => {
    if (currentTurn === botSymbol && gameStatus === "playing") {
      setIsThinking(true);
      const timer = setTimeout(() => {
        const move = getBestMove(board.map(r => [...r]), botSymbol, 3);
        if (move) {
          makeMove(move.row, move.col, botSymbol);
        }
        setIsThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameStatus, board, makeMove]);

  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== "playing" || currentTurn !== playerSymbol || isThinking) return;
    makeMove(row, col, playerSymbol);
  };

  const handleNewGame = () => {
    setBoard(createEmptyBoard());
    setCurrentTurn("X");
    setGameStatus("playing");
    setWinner(null);
    setLastMove(null);
    setWinningCells([]);
    setShowResultModal(false);
  };

  const handleBackToLobby = () => {
    router.push("/caro");
  };

  const isMyTurn = currentTurn === playerSymbol && !isThinking;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Mobile Layout */}
      <div className="md:hidden fixed inset-0 flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">
          <div className="h-14 px-4 flex items-center justify-between">
            <span className="text-2xl">❌⭕</span>
            <span className="text-lg font-bold text-gray-900">Tập luyện</span>
            <Button variant="ghost" size="sm" onClick={handleBackToLobby}>
              ✕
            </Button>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Bạn: ❌</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm">Máy: ⭕</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isThinking 
                ? "bg-yellow-100 text-yellow-700"
                : isMyTurn 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-600"
            }`}>
              {isThinking ? "🤔 Máy đang suy nghĩ..." : isMyTurn ? "Lượt của bạn" : "Lượt của máy"}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className="w-full max-w-[min(100%,calc(100vh-220px))] aspect-square">
            <CaroBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={!isMyTurn || gameStatus !== "playing"}
              lastMove={lastMove}
              winningCells={winningCells}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 pb-safe">
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={handleNewGame}>
              🔄 Ván mới
            </Button>
            <Button fullWidth onClick={handleBackToLobby}>
              Về lobby
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tập luyện Caro</h1>
              <p className="text-gray-600">Chơi với máy để rèn luyện kỹ năng</p>
            </div>
            <Button variant="outline" onClick={handleBackToLobby}>
              Về lobby
            </Button>
          </div>

          <div className="grid md:grid-cols-[1fr,350px] gap-6">
            {/* Game Board */}
            <div>
              <Card padding="md">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Lượt của: </span>
                      <span className="font-bold text-lg">
                        {isThinking ? "Máy" : isMyTurn ? "Bạn" : "Máy"}
                      </span>
                      <span className="ml-2 text-xl">
                        {currentTurn === "X" ? "❌" : "⭕"}
                      </span>
                    </div>
                    <Button variant="outline" onClick={handleNewGame}>
                      🔄 Ván mới
                    </Button>
                  </div>
                  {isThinking && (
                    <div className="text-sm text-yellow-600 flex items-center gap-2">
                      <span className="animate-pulse">🤔</span>
                      Máy đang suy nghĩ...
                    </div>
                  )}
                </div>

                <CaroBoard
                  board={board}
                  onCellClick={handleCellClick}
                  disabled={!isMyTurn || gameStatus !== "playing"}
                  lastMove={lastMove}
                  winningCells={winningCells}
                />
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              <Card padding="md">
                <h3 className="font-bold mb-3">Thông tin</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-blue-100 border-2 border-blue-500">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">❌</span>
                      <div>
                        <div className="font-medium">Bạn</div>
                        <div className="text-xs text-gray-600">Đi trước</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭕</span>
                      <div>
                        <div className="font-medium">Máy</div>
                        <div className="text-xs text-gray-600">AI</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-bold mb-2">Mẹo</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cố gắng tạo 2 đầu mở (3 liên tiếp)</li>
                  <li>• Chặn đối thủ khi họ có 3-4 liên tiếp</li>
                  <li>• Chiếm vị trí trung tâm bàn cờ</li>
                  <li>• Tạo thế đôi tấn công</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Dialog open={showResultModal} onClose={() => setShowResultModal(false)}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {winner === playerSymbol
              ? "🎉 Bạn thắng!"
              : winner === botSymbol
                ? "😢 Máy thắng!"
                : "🤝 Hòa!"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="text-center">
          {winner === playerSymbol && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
          )}
          {winner === botSymbol && (
            <div className="space-y-3">
              <div className="text-4xl">🤖</div>
              <p className="text-gray-600">
                Không sao, hãy thử lại và cải thiện chiến thuật!
              </p>
            </div>
          )}
          {!winner && <div className="text-4xl mb-4">🤝</div>}
        </DialogContent>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleNewGame} fullWidth>
            🔄 Chơi lại
          </Button>
          <Button onClick={handleBackToLobby} fullWidth>
            Về lobby
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
