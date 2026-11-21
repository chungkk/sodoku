"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CenterScreen } from "@/components/room";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <CenterScreen mood="sad" title="Ôi, có lỗi rồi">
      <p className="mb-4 text-lg font-semibold">Có gì đó không ổn. Bạn thử lại nhé.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>Thử lại</Button>
        <Button variant="outline" onClick={() => window.location.assign("/")}>Về trang chủ</Button>
      </div>
    </CenterScreen>
  );
}
