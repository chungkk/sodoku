"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Mascot, type MascotMood } from "@/components/Mascot";

/** Quân X: kẹo đỏ có dấu nhân */
export function CandyX({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="17.5" fill="#d92c45" stroke="#55303f" strokeWidth="3" />
      <path d="M13.5 13.5 26.5 26.5M26.5 13.5 13.5 26.5" stroke="#fffaf3" strokeWidth="5" strokeLinecap="round" />
      <path d="M9 15C10 11 13 8.5 17 8" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Quân O: kẹo bạc hà có vòng tròn */
export function CandyO({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="17.5" fill="#0b7f73" stroke="#55303f" strokeWidth="3" />
      <circle cx="20" cy="20" r="8" fill="none" stroke="#fffaf3" strokeWidth="5" />
      <path d="M9 15C10 11 13 8.5 17 8" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Mái che sọc đỏ trắng của hiệu kẹo */
export function Awning({ className = "" }: { className?: string }) {
  const id = `awning${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg width="100%" height="50" aria-hidden="true" className={`block ${className}`}>
      <defs>
        <pattern id={id} width="72" height="50" patternUnits="userSpaceOnUse">
          <path d="M0 -2H36V34a18 13 0 0 1-36 0Z" fill="#d92c45" stroke="#55303f" strokeWidth="3" />
          <path d="M36 -2H72V34a18 13 0 0 1-36 0Z" fill="#fffaf3" stroke="#55303f" strokeWidth="3" />
        </pattern>
      </defs>
      <rect width="100%" height="50" fill={`url(#${id})`} />
    </svg>
  );
}

/** Tắc kè và đúng một câu của nó cho màn này */
export function MascotSay({
  children,
  mood = "happy",
  look,
  followPointer = false,
  className = "",
  mascotClassName = "w-16",
}: {
  children: ReactNode;
  mood?: MascotMood;
  look?: { x: number; y: number } | null;
  followPointer?: boolean;
  className?: string;
  mascotClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Mascot mood={mood} look={look} followPointer={followPointer} className={mascotClassName} />
      <div className="relative min-w-0 flex-1">
        <svg viewBox="0 0 14 20" aria-hidden="true" className="absolute -left-[10px] top-1/2 h-5 w-[14px] -translate-y-1/2">
          <path d="M14 1 2 10l12 9" fill="#fffaf3" stroke="#55303f" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
        <p
          aria-live="polite"
          className="rounded-[1.25rem] border-[3.5px] border-ink bg-milk px-3 py-1.5 text-[0.95rem] font-semibold lg:text-lg leading-snug text-ink [text-wrap:balance]"
        >
          {children}
        </p>
      </div>
    </div>
  );
}

/** Thanh tiến độ như một thanh kẹo dài */
export function CandyBar({ value, rival = false, label }: { value: number; rival?: boolean; label: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 flex-1 overflow-hidden rounded-full border-[2.5px] border-ink bg-milk"
    >
      <motion.div
        className={`h-full rounded-full ${rival ? "stripe-fill-rival" : "stripe-fill"}`}
        initial={false}
        animate={{ width: `${width}%` }}
        transition={{ type: "spring", stiffness: 170, damping: 24 }}
      />
    </div>
  );
}

export function CandyLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-4" role="status">
      <Mascot mood="think" className="w-36" />
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-4 w-4 rounded-full border-[3px] border-ink bg-cherry"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
      <p className="font-display text-xl">{label}</p>
    </div>
  );
}

const CONFETTI_COLORS = ["#d92c45", "#ffd24d", "#0b7f73", "#ff9db0", "#fffaf3"];

/** Mưa giấy gói kẹo khi thắng */
export function WrapperRain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-3 w-6 rounded-sm border-2 border-ink"
          style={{ left: `${(i * 47) % 100}%`, backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
          initial={{ y: "-10vh", rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: (i % 2 ? 1 : -1) * (240 + i * 18) }}
          transition={{ duration: 1.8 + (i % 5) * 0.28, delay: (i % 7) * 0.09, ease: [0.3, 0.1, 0.6, 1] }}
        />
      ))}
    </div>
  );
}
