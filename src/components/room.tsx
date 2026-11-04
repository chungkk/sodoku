"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { CheckIcon, CopyIcon, CrownIcon } from "@/components/icons";

/** Mã phòng từng ký tự trên một viên kẹo, kèm nút chép */
export function RoomCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="sr-only">Mã phòng {code.split("").join(" ")}</p>
      <div aria-hidden="true" className="flex gap-1">
        {code.split("").map((char, i) => (
          <span
            key={i}
            className="candy-gloss flex h-12 w-11 items-center justify-center rounded-2xl border-4 border-ink bg-lemon font-display text-[1.65rem] sm:h-14 sm:w-[3.25rem] sm:text-3xl"
          >
            {char}
          </span>
        ))}
      </div>
      <button
        onClick={copy}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[3px] border-ink bg-milk px-4 font-bold transition-colors hover:bg-lemon-pale"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span aria-live="polite">{copied ? "Đã chép mã" : "Chép mã"}</span>
      </button>
    </div>
  );
}

/** Một ngăn trong khay: người chơi hoặc chỗ còn trống */
export function PlayerSlot({
  name,
  isMe,
  badge,
  status,
  statusActive,
  piece,
  offline,
}: {
  name: string;
  isMe?: boolean;
  badge?: "host";
  status?: string;
  statusActive?: boolean;
  piece?: ReactNode;
  offline?: boolean;
}) {
  return (
    <li className={`flex min-h-16 items-center gap-3 rounded-[1.25rem] border-4 border-ink p-2 ${isMe ? "bg-lemon-pale" : "bg-white"} ${offline ? "opacity-60" : ""}`}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        {piece ?? (
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-ink bg-gum font-display text-xl">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        {badge === "host" && <CrownIcon aria-label="Chủ phòng" className="absolute -right-1.5 -top-2 rotate-12 text-xl text-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-bold leading-tight">
          {name}
        </span>
        <span className="block font-semibold leading-tight text-ink-soft">
          {offline ? "Đang kết nối lại…" : [isMe ? "Bạn" : "", badge === "host" ? "Chủ phòng" : ""].filter(Boolean).join(" · ")}
        </span>
      </span>
      {status && (
        <span className={`shrink-0 rounded-full border-[3px] border-ink px-2.5 py-0.5 font-bold ${statusActive ? "bg-teal text-milk" : "bg-milk text-ink"}`}>
          {status}
        </span>
      )}
    </li>
  );
}

export function EmptySlot({ count = 1 }: { count?: number }) {
  return (
    <li className="flex min-h-14 items-center justify-center rounded-[1.25rem] border-4 border-dashed border-ink/45 p-2 text-center font-semibold text-ink-soft">
      Còn {count} chỗ trống, mời thêm bạn nhé
    </li>
  );
}

/** Đếm ngược trước khi vào ván */
export function CountdownOverlay({ value }: { value: number }) {
  return (
    <div role="status" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-mint">
      <Mascot mood="wow" className="w-44" />
      <p className="font-display text-2xl">Sắp vào ván rồi!</p>
      <motion.div
        key={value}
        initial={{ scale: 0.3, y: -60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 14 }}
        className="candy-gloss candy-gloss-round flex h-36 w-36 items-center justify-center rounded-full border-[6px] border-ink bg-cherry font-display text-8xl text-milk"
      >
        {value === 0 ? "Đi!" : value}
      </motion.div>
    </div>
  );
}

/** Màn báo một việc duy nhất: lỗi, không tìm thấy, nhập tên */
export function CenterScreen({ mood = "happy", title, children }: { mood?: "happy" | "sad" | "think"; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 px-4 py-8">
      <Mascot mood={mood} className="-mb-3 w-40" />
      <div className="tray w-full p-5 text-center">
        <h1 className="font-display text-2xl leading-tight">{title}</h1>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
