"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

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
  buttonText = "▸ TIẾP TỤC",
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
      <div className="space-y-2">
        <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider">
          ► Tên người chơi
        </label>
        <input
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={handleChange}
          disabled={isLoading}
          autoFocus
          maxLength={20}
          className={`
            w-full px-4 py-3 bg-transparent border-2 
            ${error ? 'border-red-500' : 'border-cyan-400/50 focus:border-cyan-400'}
            text-white font-mono text-lg
            placeholder:text-gray-600
            focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          `}
        />
        {error && (
          <p className="text-sm text-red-400 font-mono">► {error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={name.trim().length < 2 || isLoading}
        className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "ĐANG XỬ LÝ..." : buttonText}
      </button>
    </motion.form>
  );
}
