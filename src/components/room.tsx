"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Mascot } from "@/components/Mascot";
import { CheckIcon, CopyIcon, CrownIcon, LinkIcon, QrCodeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback phía dưới cho môi trường HTTP nội bộ (LAN)
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Mã phòng từng ký tự trên một viên kẹo, kèm nút chép mã, chép link và hiện mã QR */
export function RoomCode({ code, sharePath }: { code: string; sharePath?: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const getShareUrl = () => {
    const path = sharePath ?? window.location.pathname;
    return `${window.location.origin}${path}`;
  };

  const handleCopy = async (kind: "code" | "link") => {
    const value = kind === "code" ? code : getShareUrl();
    const ok = await copyText(value);
    if (!ok) {
      setCopied(null);
      return;
    }
    setCopied(kind);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
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

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleCopy("code")}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[3px] border-ink bg-milk px-3.5 text-sm font-bold transition-colors hover:bg-lemon-pale sm:text-base"
        >
          {copied === "code" ? <CheckIcon /> : <CopyIcon />}
          <span aria-live="polite">{copied === "code" ? "Đã chép mã" : "Chép mã"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleCopy("link")}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[3px] border-ink bg-milk px-3.5 text-sm font-bold transition-colors hover:bg-lemon-pale sm:text-base"
        >
          {copied === "link" ? <CheckIcon /> : <LinkIcon />}
          <span aria-live="polite">{copied === "link" ? "Đã chép link" : "Chép link"}</span>
        </button>

        <button
          type="button"
          onClick={() => setQrUrl(getShareUrl())}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[3px] border-ink bg-lemon-pale px-3.5 text-sm font-bold transition-colors hover:bg-lemon sm:text-base"
        >
          <QrCodeIcon />
          <span>Mã QR</span>
        </button>
      </div>

      <Dialog open={qrUrl !== null} onClose={() => setQrUrl(null)}>
        <DialogHeader>
          <DialogTitle>Quét mã để vào phòng</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col items-center gap-3 text-center">
          <p className="text-base font-semibold text-ink-soft">
            Mở camera trên điện thoại để vào phòng <span className="font-display text-ink">{code}</span> ngay.
          </p>
          {qrUrl && (
            <div className="rounded-[1.25rem] border-4 border-ink bg-white p-4">
              <QRCodeSVG
                value={qrUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#55303f"
                level="M"
                title={`Mã QR vào phòng ${code}`}
              />
            </div>
          )}
          {qrUrl && (
            <p className="w-full break-all rounded-2xl border-[3px] border-ink/25 bg-milk px-3 py-2 text-sm font-semibold text-ink-soft">
              {qrUrl}
            </p>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleCopy("link")}>
            {copied === "link" ? <CheckIcon /> : <LinkIcon />}
            <span>{copied === "link" ? "Đã chép link" : "Chép link"}</span>
          </Button>
          <Button onClick={() => setQrUrl(null)}>Đóng</Button>
        </DialogFooter>
      </Dialog>
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
