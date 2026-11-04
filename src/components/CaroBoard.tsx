"use client";

import { memo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Board } from "@/lib/caro";
import { CandyO, CandyX } from "@/components/candy";
import { ExpandIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { BOARD_SIZE } from "@/lib/caro";

interface CaroBoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
  lastMove?: { row: number; col: number } | null;
  winningCells?: { row: number; col: number }[];
}

export const CaroBoard = memo(function CaroBoard({
  board,
  onCellClick,
  disabled = false,
  lastMove,
  winningCells = [],
}: CaroBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastTouchDistance = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const dragStart = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  const isWinningCell = (row: number, col: number) => {
    return winningCells.some((cell) => cell.row === row && cell.col === col);
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col;
  };

  const constrainPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (!containerRef.current || !boardRef.current) return { x, y };
    
    const container = containerRef.current.getBoundingClientRect();
    const board = boardRef.current.getBoundingClientRect();
    
    const scaledWidth = (board.width / scale) * currentScale;
    const scaledHeight = (board.height / scale) * currentScale;
    
    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);
    
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }, [scale]);

  const handleZoom = useCallback((newScale: number, centerX?: number, centerY?: number) => {
    const constrainedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    
    if (constrainedScale === MIN_SCALE) {
      setScale(MIN_SCALE);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(constrainedScale);
      if (centerX !== undefined && centerY !== undefined) {
        const scaleRatio = constrainedScale / scale;
        const newPos = constrainPosition(
          position.x * scaleRatio,
          position.y * scaleRatio,
          constrainedScale
        );
        setPosition(newPos);
      } else {
        const newPos = constrainPosition(position.x, position.y, constrainedScale);
        setPosition(newPos);
      }
    }
  }, [scale, position, constrainPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double tap to zoom
        e.preventDefault();
        if (scale > MIN_SCALE) {
          handleZoom(MIN_SCALE);
        } else {
          handleZoom(2);
        }
        lastTap.current = 0;
      } else {
        lastTap.current = now;
        if (scale > MIN_SCALE) {
          setIsDragging(true);
          dragStart.current = {
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
          };
        }
      }
    }
  }, [scale, position, handleZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const scaleChange = distance / lastTouchDistance.current;
      handleZoom(scale * scaleChange);
      
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && isDragging && scale > MIN_SCALE) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.current.x;
      const newY = e.touches[0].clientY - dragStart.current.y;
      const constrained = constrainPosition(newX, newY, scale);
      setPosition(constrained);
    }
  }, [scale, isDragging, handleZoom, constrainPosition]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    handleZoom(scale * delta);
  }, [scale, handleZoom]);

  const zoomButton = "flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-ink bg-milk text-lg transition-colors hover:bg-lemon-pale disabled:opacity-45";

  return (
    <div className="caro-board relative w-full">
      <div className="absolute -top-1 right-1 z-10 flex -translate-y-full gap-1 pb-1 md:hidden">
        <button onClick={() => handleZoom(scale + 0.3)} disabled={scale >= MAX_SCALE} aria-label="Phóng to bàn cờ" className={zoomButton}>
          <PlusIcon />
        </button>
        <button onClick={() => handleZoom(scale - 0.3)} disabled={scale <= MIN_SCALE} aria-label="Thu nhỏ bàn cờ" className={zoomButton}>
          <MinusIcon />
        </button>
        {scale > MIN_SCALE && (
          <button onClick={() => handleZoom(MIN_SCALE)} aria-label="Xem toàn bộ bàn cờ" className={zoomButton}>
            <ExpandIcon />
          </button>
        )}
      </div>

      <div className="tray overflow-hidden !rounded-[1.5rem] p-1">
        <div
          ref={containerRef}
          className="relative aspect-square w-full touch-none overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <div
            ref={boardRef}
            className="relative grid aspect-square w-full transition-transform duration-200 ease-out"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isWinning = isWinningCell(rowIndex, colIndex);
                const isLast = isLastMove(rowIndex, colIndex);
                const canPlay = !disabled && cell === null;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                    disabled={disabled || cell !== null}
                    aria-label={`Ô hàng ${rowIndex + 1}, cột ${colIndex + 1}, ${cell ? `quân ${cell}` : "trống"}`}
                    className={`
                      group relative flex h-full w-full items-center justify-center p-[7%]
                      ${canPlay ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-[6%] rounded-[30%] transition-colors ${
                        isWinning ? "bg-lemon" : isLast ? "bg-lemon-pale ring-2 ring-inset ring-ink/50" : canPlay ? "bg-mint-pale ring-1 ring-inset ring-ink/30 group-hover:bg-lemon-pale" : "bg-mint-pale ring-1 ring-inset ring-ink/30"
                      }`}
                    />
                    {cell && (
                      <motion.span
                        className="relative block h-full w-full"
                        initial={{ y: "-110%", scale: 0.6 }}
                        animate={isWinning ? { y: [0, "-14%", 0], scale: 1 } : { y: 0, scale: 1 }}
                        transition={
                          isWinning
                            ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
                            : { type: "spring", stiffness: 560, damping: 15 }
                        }
                      >
                        {cell === "X" ? <CandyX className="h-full w-full" /> : <CandyO className="h-full w-full" />}
                      </motion.span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
