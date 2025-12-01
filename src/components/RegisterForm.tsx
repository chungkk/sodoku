"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
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

    // Client-side validation
    if (!formData.email || !formData.password || !formData.displayName) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.displayName.length < 2 || formData.displayName.length > 20) {
      setError("Tên hiển thị phải từ 2-20 ký tự");
      return;
    }

    setIsLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.displayName
    );

    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Đăng ký thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName" className="font-retro text-sm">
          Tên hiển thị
        </Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="Nhập tên hiển thị (2-20 ký tự)"
          value={formData.displayName}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-background border-border"
          autoComplete="name"
        />
      </div>

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
          placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-background border-border"
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="font-retro text-sm">
          Xác nhận mật khẩu
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-background border-border"
          autoComplete="new-password"
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
        {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
