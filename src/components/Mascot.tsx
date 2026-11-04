"use client";

import { useEffect, useId, useRef } from "react";

export type MascotMood = "happy" | "cheer" | "think" | "sad" | "sleep" | "wow";

interface MascotProps {
  className?: string;
  mood?: MascotMood;
  /** Hướng nhìn, mỗi trục từ -1 đến 1 */
  look?: { x: number; y: number } | null;
  /** Mắt nhìn theo con trỏ chuột */
  followPointer?: boolean;
  animated?: boolean;
}

const PUPIL_TRAVEL = 38;
const INK = "#55303f";
const MILK = "#fffaf3";
const STRIPE = "#e8384f";
const BODY = "M560 372 C640 325 765 375 805 495 C840 605 805 705 722 750 C650 785 560 745 530 655 C500 565 500 440 560 372 Z";
const HEAD = "M192 424 C194 396 236 368 258 306 C288 228 360 202 430 200 C560 195 640 285 636 410 C632 540 540 640 415 632 C325 626 262 572 222 486 C208 462 190 450 192 424 Z";
const MOUTH = "M232 442 C330 468 480 462 590 402 C590 505 510 598 412 592 C330 586 268 520 232 442 Z";
const HAT = "M418 208 C440 130 560 110 640 170 C690 210 700 280 672 330 C600 262 510 225 418 208 Z";
const TAIL = "M770 700 C815 800 765 925 645 935 C545 943 480 865 512 795 C538 738 625 735 650 790 C668 836 628 862 600 846";
const BRANCH = "M150 716 C330 690 620 690 845 722";

function pupilTransform(look: { x: number; y: number }) {
  return `translate(${look.x * PUPIL_TRAVEL}px, ${look.y * PUPIL_TRAVEL}px)`;
}

/** Tắc kè hoa sọc kẹo của Solo Games, có biểu cảm và mắt nhìn theo ô đang chọn. */
export function Mascot({ className = "", mood = "happy", look = null, followPointer = false, animated = true }: MascotProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!followPointer) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const pupils = pupilsRef.current;
        if (!svg || !pupils) return;
        const box = svg.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width * 0.4);
        const dy = event.clientY - (box.top + box.height * 0.32);
        const distance = Math.hypot(dx, dy) || 1;
        const strength = Math.min(1, distance / 240);
        pupils.style.transform = pupilTransform({ x: (dx / distance) * strength, y: (dy / distance) * strength });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [followPointer]);

  const closedEyes = mood === "cheer" || mood === "sleep";
  const lookAt = look ?? (mood === "think" ? { x: 0.2, y: -0.5 } : mood === "sad" ? { x: -0.3, y: 0.5 } : { x: -0.62, y: 0.14 });
  const id = (name: string) => `${name}${uid}`;

  return (
    <svg
      ref={svgRef}
      viewBox="150 60 800 900"
      aria-hidden="true"
      className={`shrink-0 overflow-visible ${animated ? "mascot-animated" : ""} ${mood === "cheer" ? "mascot-cheer" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={id("lens")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6f7f4" />
          <stop offset="1" stopColor="#b9e0da" />
        </linearGradient>
        <linearGradient id={id("wood")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a3c" />
          <stop offset="1" stopColor="#5c3a28" />
        </linearGradient>
        <clipPath id={id("body")}><path d={BODY} /></clipPath>
        <clipPath id={id("mouth")}><path d={MOUTH} /></clipPath>
        <clipPath id={id("hat")}><path d={HAT} /></clipPath>
      </defs>

      <g transform="translate(64 -14) scale(.97)">
        <path d={BRANCH} fill="none" stroke={INK} strokeWidth="48" strokeLinecap="round" />
        <path d={BRANCH} fill="none" stroke={`url(#${id("wood")})`} strokeWidth="32" strokeLinecap="round" />
        <g className="m-leaf">
          <path d="M210 702 C190 660 215 630 262 628 C272 668 250 700 210 702 Z" fill="#7ccf8e" stroke={INK} strokeWidth="9" strokeLinejoin="round" />
        </g>

        <g className="m-tail">
          <path d={TAIL} fill="none" stroke={INK} strokeWidth="60" strokeLinecap="round" />
          <path d={TAIL} fill="none" stroke={MILK} strokeWidth="46" strokeLinecap="round" />
          <path d={TAIL} fill="none" stroke={STRIPE} strokeWidth="46" strokeDasharray="58 58" />
        </g>

        <g className="m-body">
          <path d={BODY} fill={MILK} />
          <g clipPath={`url(#${id("body")})`}>
            <path d="M740 300 L850 400 L500 760 L420 690 Z" fill={STRIPE} />
            <path d="M880 500 L930 600 L650 860 L570 800 Z" fill={STRIPE} />
          </g>
          <path d={BODY} fill="none" stroke={INK} strokeWidth="13" strokeLinejoin="round" />
        </g>

        <g className="m-head">
          <path d={HEAD} fill={MILK} stroke={INK} strokeWidth="13" strokeLinejoin="round" />

          {(mood === "happy" || mood === "cheer") && (
            <g>
              <path d={MOUTH} fill="#8f2036" stroke={INK} strokeWidth="11" strokeLinejoin="round" />
              <g clipPath={`url(#${id("mouth")})`}>
                <path d="M300 615 C320 505 455 490 520 620 Z" fill="#f58a8e" />
                <path d="M410 520 C408 550 410 575 414 600" fill="none" stroke="#d9626c" strokeWidth="7" strokeLinecap="round" />
                <path d="M240 444 C340 470 480 465 590 405 L590 424 C480 482 340 488 250 462 Z" fill={MILK} />
              </g>
            </g>
          )}
          {mood === "wow" && (
            <g>
              <ellipse cx="405" cy="515" rx="58" ry="68" fill="#8f2036" stroke={INK} strokeWidth="11" />
              <ellipse cx="405" cy="552" rx="38" ry="26" fill="#f58a8e" />
            </g>
          )}
          {mood === "think" && <path d="M310 505 C370 545 450 540 505 495" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />}
          {mood === "sleep" && <path d="M350 515 C380 535 430 535 460 512" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />}
          {mood === "sad" && <path d="M315 550 C365 495 450 490 505 540" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />}

          <ellipse cx="578" cy="510" rx="27" ry="17" fill="#f9a8a8" opacity=".7" />

          <path d={HAT} fill={MILK} stroke={INK} strokeWidth="12" strokeLinejoin="round" />
          <g clipPath={`url(#${id("hat")})`}>
            <path d="M430 150 L500 110 L640 340 L560 320 Z" fill={STRIPE} />
            <path d="M590 100 L650 120 L760 300 L690 340 Z" fill={STRIPE} />
          </g>
          <path d={HAT} fill="none" stroke={INK} strokeWidth="12" strokeLinejoin="round" />
          <g className="m-pompom">
            <circle cx="716" cy="194" r="44" fill={MILK} stroke={INK} strokeWidth="14" />
            <circle cx="706" cy="184" r="20" fill="#fff" />
          </g>

          <path d="M397 322 C410 306 428 306 442 320" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d="M580 300 L622 330" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <circle cx="322" cy="330" r="82" fill={`url(#${id("lens")})`} stroke={INK} strokeWidth="12" />
          <circle cx="512" cy="312" r="86" fill={`url(#${id("lens")})`} stroke={INK} strokeWidth="12" />

          {closedEyes ? (
            <g fill="none" stroke={INK} strokeWidth="15" strokeLinecap="round">
              <path d={mood === "cheer" ? "M285 345 C300 310 345 310 360 345" : "M285 330 C305 355 340 355 360 330"} />
              <path d={mood === "cheer" ? "M475 328 C490 292 535 292 550 328" : "M475 312 C495 338 530 338 550 312"} />
            </g>
          ) : (
            <g ref={pupilsRef} className="m-pupils" style={{ transform: pupilTransform(lookAt) }}>
              <g className="m-blink">
                <circle cx="322" cy="336" r="29" fill={INK} />
                <circle cx="311" cy="323" r="10" fill="#fff" />
                <circle cx="331" cy="348" r="4.5" fill="#fff" />
              </g>
              <g className="m-blink">
                <circle cx="512" cy="318" r="30" fill={INK} />
                <circle cx="501" cy="305" r="10" fill="#fff" />
                <circle cx="522" cy="331" r="4.5" fill="#fff" />
              </g>
            </g>
          )}

          {mood === "sad" && (
            <g fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round">
              <path d="M262 232 C290 220 320 222 345 240" />
              <path d="M495 215 C520 200 555 205 580 226" />
            </g>
          )}

          <path d="M276 278 C290 266 306 262 322 264" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".8" />
          <path d="M466 258 C480 246 496 242 512 244" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".8" />
        </g>

        <g>
          <path d="M592 610 C570 650 566 680 572 716" fill="none" stroke={INK} strokeWidth="84" strokeLinecap="round" />
          <path d="M592 610 C570 650 566 680 572 716" fill="none" stroke={MILK} strokeWidth="60" strokeLinecap="round" />
          <path d="M556 728 L558 744 M586 730 L586 746" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          <path d="M738 640 C716 672 706 696 712 726" fill="none" stroke={INK} strokeWidth="84" strokeLinecap="round" />
          <path d="M738 640 C716 672 706 696 712 726" fill="none" stroke={MILK} strokeWidth="60" strokeLinecap="round" />
          <path d="M696 738 L698 754 M726 740 L726 756" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
