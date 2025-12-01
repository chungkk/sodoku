"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="font-retro text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border p-6 space-y-6">
          <div className="text-center">
            <h1 className="font-pixel text-2xl text-primary mb-2">ĐĂNG KÝ</h1>
            <p className="text-muted-foreground text-sm">
              Tạo tài khoản để lưu điểm số và xếp hạng
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
