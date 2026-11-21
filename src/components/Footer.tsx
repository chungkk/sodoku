"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.endsWith("/play") || pathname === "/practice") return null;

  return (
    <footer className="mt-auto px-4 py-5 text-center font-semibold text-ink-soft">
      Solo Games · Không cần tài khoản, nhập tên là chơi
    </footer>
  );
}
