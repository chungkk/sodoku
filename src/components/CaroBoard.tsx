"use client";

import { memo, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { Board, CellValue } from "@/lib/caro";
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

  return (
    <div className="w-full space-y-3">
      {/* Zoom Controls for Mobile */}
      <div className="flex justify-end gap-2 md:hidden">
        <button
          onClick={() => handleZoom(scale + 0.3)}
          disabled={scale >= MAX_SCALE}
          className="bg-white hover:bg-amber-50 shadow-md rounded-lg p-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border border-amber-200"
        >
          <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => handleZoom(scale - 0.3)}
          disabled={scale <= MIN_SCALE}
          className="bg-white hover:bg-amber-50 shadow-md rounded-lg p-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border border-amber-200"
        >
          <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        {scale > MIN_SCALE && (
          <button
            onClick={() => handleZoom(MIN_SCALE)}
            className="bg-white hover:bg-amber-50 shadow-md rounded-lg p-2.5 transition-all active:scale-95 border border-amber-200"
          >
            <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-2 md:p-4 w-full">
      <div 
        ref={containerRef}
        className="relative w-full aspect-square overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
      {/* Grid container với background lines */}
      <div 
        ref={boardRef}
        className="relative w-full aspect-square transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Horizontal lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: BOARD_SIZE + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 bg-amber-900/30"
              style={{
                top: `${(i / BOARD_SIZE) * 100}%`,
                height: "1px",
              }}
            />
          ))}
        </div>
        
        {/* Vertical lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: BOARD_SIZE + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 bg-amber-900/30"
              style={{
                left: `${(i / BOARD_SIZE) * 100}%`,
                width: "1px",
              }}
            />
          ))}
        </div>

        {/* Game board */}
        <div
          className="absolute inset-0 grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isWinning = isWinningCell(rowIndex, colIndex);
              const isLast = isLastMove(rowIndex, colIndex);

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  disabled={disabled || cell !== null}
                  className={`
                    relative w-full h-full
                    flex items-center justify-center
                    transition-colors
                    ${!disabled && cell === null ? "hover:bg-amber-100/50 cursor-pointer" : ""}
                    ${disabled || cell !== null ? "cursor-not-allowed" : ""}
                    ${isWinning ? "bg-green-200/70" : ""}
                    ${isLast ? "bg-blue-100/50" : ""}
                  `}
                >
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className={`
                        absolute inset-0
                        flex items-center justify-center
                        font-bold select-none pointer-events-none
                        ${cell === "X" ? "text-blue-600" : "text-red-600"}
                        ${isWinning ? "text-green-700" : ""}
                      `}
                      style={{ 
                        fontSize: "clamp(16px, 3vw, 28px)",
                        lineHeight: 1,
                      }}
                    >
                      {cell}
                    </motion.span>
                  )}

                  {!cell && !disabled && (
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
});
