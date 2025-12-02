"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = useCallback((): string | null => {
    if (displayName.trim().length < 2) {
      return "Tên hiển thị phải có ít nhất 2 ký tự";
    }
    if (displayName.trim().length > 20) {
      return "Tên hiển thị không được quá 20 ký tự";
    }
    if (!email.includes("@")) {
      return "Email không hợp lệ";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp";
    }
    return null;
  }, [displayName, email, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: displayName.trim(),
            email: email.toLowerCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Đăng ký thất bại");
          setIsLoading(false);
          return;
        }

        const result = await signIn("credentials", {
          email: email.toLowerCase(),
          password,
          redirect: false,
        });

        if (result?.error) {
          router.push("/login");
        } else {
          router.push("/");
          router.refresh();
        }
      } catch {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
        setIsLoading(false);
      }
    },
    [displayName, email, password, validateForm, router]
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Input
        label="Tên hiển thị"
        placeholder="Tên của bạn"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        maxLength={20}
      />

      <Input
        label="Email"
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Ít nhất 6 ký tự"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      {error && (
        <p className="text-sm text-error-500 text-center">{error}</p>
      )}

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={!displayName || !email || !password || !confirmPassword || isLoading}
        isLoading={isLoading}
      >
        Đăng ký
      </Button>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary-500 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </motion.form>
  );
}
