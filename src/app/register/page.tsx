"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-2xl mr-2">🎮</span>
            Đăng ký tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
