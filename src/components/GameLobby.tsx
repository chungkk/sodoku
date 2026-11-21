"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { MascotSay } from "@/components/candy";
import { BackIcon } from "@/components/icons";

interface GameLobbyProps {
  gameType: "sudoku" | "caro";
  title: string;
  say: string;
  facts: string[];
}

const TABS = [
  ["create", "Tạo phòng"],
  ["join", "Có mã phòng"],
] as const;

/** Sảnh của một trò: mở khay ra là tạo phòng hoặc nhập mã được ngay. */
export function GameLobby({ gameType, title, say, facts }: GameLobbyProps) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTabKeyDown = (index: number, e: React.KeyboardEvent) => {
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") nextIdx = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") nextIdx = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = TABS.length - 1;
    if (nextIdx === null) return;
    e.preventDefault();
    setMode(TABS[nextIdx][0]);
    tabRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 pb-6 [@media(max-height:700px)]:gap-2">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 rounded-full font-semibold hover:decoration-cherry">
          <BackIcon className="text-lg" /> Trang chủ
        </Link>
        <h1 className="title-candy mt-1 text-[clamp(3.25rem,16vw,5rem)] [@media(max-height:700px)]:text-[2.5rem]">{title}</h1>
      </div>

      <MascotSay mascotClassName="w-24 [@media(max-height:700px)]:w-14">{say}</MascotSay>

      <div className="tray flex flex-col gap-4 p-4 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:p-3">
        <div role="tablist" aria-label="Cách vào chơi" className="grid grid-cols-2 gap-1 rounded-full border-4 border-ink bg-mint-pale p-1">
          {TABS.map(([value, label], index) => (
            <button
              key={value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`${baseId}-tab-${value}`}
              type="button"
              role="tab"
              aria-selected={mode === value}
              aria-controls={`${baseId}-panel-${value}`}
              tabIndex={mode === value ? 0 : -1}
              onClick={() => setMode(value)}
              onKeyDown={(e) => handleTabKeyDown(index, e)}
              className={`min-h-10 rounded-full text-[1.05rem] font-bold transition-colors ${
                mode === value ? "bg-lemon ring-[3px] ring-ink" : "hover:bg-milk"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${mode}`}
          aria-labelledby={`${baseId}-tab-${mode}`}
        >
          {mode === "create" ? <CreateRoomForm gameType={gameType} /> : <JoinRoomForm gameType={gameType} />}
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-2">
        {facts.map((fact) => (
          <li key={fact} className="rounded-full border-[3px] border-ink bg-milk px-3 py-0.5 font-semibold">
            {fact}
          </li>
        ))}
      </ul>
    </div>
  );
}
