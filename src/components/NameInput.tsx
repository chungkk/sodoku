"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NameInputProps {
  onSubmit: (name: string) => void;
  placeholder?: string;
  buttonText?: string;
  isLoading?: boolean;
  initialValue?: string;
}

export function NameInput({
  onSubmit,
  placeholder = "Nhập tên của bạn",
  buttonText = "Tiếp tục",
  isLoading = false,
  initialValue = "",
}: NameInputProps) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validateName = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return "Tên phải có ít nhất 2 ký tự";
    }
    if (trimmed.length > 20) {
      return "Tên không được quá 20 ký tự";
    }
    return null;
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validateName(name);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onSubmit(name.trim());
    },
    [name, validateName, onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      if (error) {
        const validationError = validateName(e.target.value);
        setError(validationError);
      }
    },
    [error, validateName]
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Input
        label="Tên người chơi"
        placeholder={placeholder}
        value={name}
        onChange={handleChange}
        error={error || undefined}
        disabled={isLoading}
        autoFocus
        maxLength={20}
      />
      <Button
        type="submit"
        fullWidth
        disabled={name.trim().length < 2 || isLoading}
        isLoading={isLoading}
      >
        {buttonText}
      </Button>
    </motion.form>
  );
}
