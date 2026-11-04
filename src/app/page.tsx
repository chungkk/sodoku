"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MascotSay, CandyO, CandyX } from "@/components/candy";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { usePlayer } from "@/contexts/PlayerContext";

const dropIn = (delay: number) => ({
  initial: { y: -30, scale: 0.7 },
  animate: { y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 420, damping: 15, delay },
});

const SUDOKU_SAMPLE = [5, 0, 3, 0, 7, 0, 9, 0, 1];
const CARO_SAMPLE = ["X", "O", "X", "O", "X", "O", "", "O", "X"];

export default function HomePage() {
  const { player } = usePlayer();
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-x-10 px-4 pb-6 lg:grid-cols-[1fr_31rem] lg:content-center">
      <div className="flex flex-col items-center lg:items-start">
        <h1 className="title-candy pt-1 text-center text-[clamp(3.5rem,18vw,4.75rem)] [@media(max-height:740px)]:text-[clamp(3rem,13.5vw,4rem)] lg:text-left lg:text-[5.75rem] lg:[@media(max-height:740px)]:text-[5.75rem]">
          <span className="block [@media(max-height:740px)]:inline lg:inline">Solo </span>
          <span className="block [@media(max-height:740px)]:inline lg:inline">Games</span>
        </h1>
        <MascotSay followPointer className="my-1 w-full lg:mt-4" mascotClassName="w-40 [@media(max-height:740px)]:w-28 sm:w-48 lg:w-96 lg:[@media(max-height:740px)]:w-72">
          {player ? `Chào ${player.name}, chọn một khay đi nào!` : "Chọn một khay đi nào!"}
        </MascotSay>
      </div>

      <div className="flex flex-col gap-4 lg:self-center">
        <div className="tray grid grid-cols-2 gap-2.5 p-2.5">
          <Link href="/sudoku" className="group flex flex-col rounded-[1.25rem] border-4 border-ink bg-lemon p-3 transition-transform hover:-translate-y-1">
            <span className="font-display text-[1.75rem] leading-none">Sudoku</span>
            <span className="mt-2 grid grid-cols-3 gap-1">
              {SUDOKU_SAMPLE.map((n, i) => (
                <motion.span
                  key={i}
                  {...dropIn(0.12 + i * 0.05)}
                  className={`flex aspect-square items-center justify-center rounded-full text-lg font-extrabold ${n ? "border-[3px] border-ink bg-milk" : "border-[3px] border-dashed border-ink/40"}`}
                >
                  {n || ""}
                </motion.span>
              ))}
            </span>
            <span className="mt-2 text-[0.95rem] font-semibold leading-tight [text-wrap:balance]">2–4 người, ai giải xong trước thắng</span>
          </Link>

          <Link href="/caro" className="group flex flex-col rounded-[1.25rem] border-4 border-ink bg-gum p-3 transition-transform hover:-translate-y-1">
            <span className="font-display text-[1.75rem] leading-none">Caro</span>
            <span className="mt-2 grid grid-cols-3 gap-1">
              {CARO_SAMPLE.map((c, i) => (
                <motion.span key={i} {...dropIn(0.3 + i * 0.05)} className="flex aspect-square items-center justify-center">
                  {c === "X" && <CandyX className="w-full" />}
                  {c === "O" && <CandyO className="w-full" />}
                  {!c && <span className="block h-full w-full rounded-full border-[3px] border-dashed border-ink/40" />}
                </motion.span>
              ))}
            </span>
            <span className="mt-2 text-[0.95rem] font-semibold leading-tight [text-wrap:balance]">2 người, 5 viên liền nhau là thắng</span>
          </Link>
        </div>

        <Button wrapped fullWidth size="lg" onClick={() => setShowJoin(true)}>
          Vào bằng mã phòng
        </Button>

        <Link href="/practice" className="text-center text-lg font-semibold underline decoration-[3px] underline-offset-4 hover:decoration-cherry">
          Luyện Sudoku một mình
        </Link>
      </div>

      <Dialog open={showJoin} onClose={() => setShowJoin(false)}>
        <DialogHeader>
          <DialogTitle>Nhập mã phòng</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <JoinRoomForm gameType="any" onCancel={() => setShowJoin(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
