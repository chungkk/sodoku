"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/LoginForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-2xl mr-2">🎮</span>
            Đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
