"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card padding="lg" className="max-w-md text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đã xảy ra lỗi
        </h1>
        <p className="text-gray-600 mb-6">
          Có gì đó không ổn. Vui lòng thử lại sau.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Thử lại</Button>
          <Button variant="ghost" onClick={() => window.location.href = "/"}>
            Về trang chủ
          </Button>
        </div>
      </Card>
    </div>
  );
}
