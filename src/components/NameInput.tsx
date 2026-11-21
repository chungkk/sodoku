"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface NameInputProps {
  onSubmit: (name: string) => void;
  placeholder?: string;
  buttonText?: string;
  isLoading?: boolean;
  initialValue?: string;
}

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) return "Tên cần ít nhất 2 ký tự";
  if (trimmed.length > 20) return "Tên dài tối đa 20 ký tự";
  return null;
}

export function NameInput({
  onSubmit,
  placeholder = "Ví dụ: Minh",
  buttonText = "Tiếp tục",
  isLoading = false,
  initialValue = "",
}: NameInputProps) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validateName(name);
      setError(validationError);
      if (!validationError) onSubmit(name.trim());
    },
    [name, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-lg font-bold">Tên của bạn</span>
        <input
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(validateName(e.target.value));
          }}
          disabled={isLoading}
          autoFocus
          maxLength={20}
          aria-invalid={!!error}
          className={`w-full rounded-2xl border-4 bg-white px-4 py-3 text-xl font-semibold text-ink placeholder:text-ink-soft focus:ring-4 focus:ring-lemon disabled:opacity-60 ${
            error ? "border-cherry focus:border-cherry" : "border-ink focus:border-ink"
          }`}
        />
      </label>
      {error && <p role="alert" className="font-semibold text-cherry">{error}</p>}
      <Button type="submit" wrapped fullWidth size="lg" disabled={name.trim().length < 2} isLoading={isLoading}>
        {buttonText}
      </Button>
    </form>
  );
}
