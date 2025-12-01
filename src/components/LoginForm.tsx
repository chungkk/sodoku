"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-retro text-sm">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Nhập email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-background border-border"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-retro text-sm">
          Mật khẩu
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-background border-border"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 text-destructive text-sm font-retro">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full font-retro text-lg py-6"
      >
        {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
