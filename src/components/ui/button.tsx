"use client";

import { forwardRef, type ReactNode, type MouseEventHandler } from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  /** Viên kẹo gói có hai đầu giấy xoắn, chỉ dùng cho hành động chính của màn */
  wrapped?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-cherry text-milk candy-gloss hover:brightness-110",
  secondary: "bg-lemon text-ink candy-gloss hover:brightness-105",
  outline: "bg-milk text-ink hover:bg-lemon-pale",
  ghost: "border-transparent bg-transparent text-ink hover:bg-ink/10",
  danger: "bg-cherry text-milk candy-gloss hover:brightness-110",
};

const earColors: Record<ButtonVariant, string> = {
  primary: "#d92c45",
  secondary: "#ffd24d",
  outline: "#fffaf3",
  ghost: "transparent",
  danger: "#d92c45",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-base",
  md: "min-h-12 px-5 text-lg",
  lg: "min-h-16 px-7 text-2xl",
};

function WrapperEar({ color, side }: { color: string; side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 30 56"
      aria-hidden="true"
      className={`absolute top-1/2 h-[76%] w-7 -translate-y-1/2 ${side === "left" ? "-left-[23px]" : "-right-[23px] -scale-x-100"}`}
    >
      <path
        d="M28 18 4 4c-3 8-2 12 1 15-4 5-4 12 0 18-3 3-4 8-1 15l24-14Z"
        fill={color}
        stroke="#55303f"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M26 24 13 22M26 32l-13 2" stroke="#55303f" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      wrapped = false,
      disabled,
      className = "",
      children,
      type = "button",
      onClick,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const widthClass = wrapped ? (fullWidth ? "w-[calc(100%-2.75rem)] mx-[1.375rem]" : "mx-[1.375rem]") : fullWidth ? "w-full" : "";

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-busy={isLoading || undefined}
        whileHover={isDisabled ? undefined : { y: -2 }}
        whileTap={isDisabled ? undefined : { scale: 0.96, y: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        disabled={isDisabled}
        className={`
          relative inline-flex items-center justify-center gap-2 rounded-full border-4 border-ink
          font-display leading-none transition-[filter,background-color]
          disabled:cursor-not-allowed disabled:opacity-55 disabled:saturate-50
          ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}
        `}
      >
        {wrapped && <WrapperEar color={earColors[variant]} side="left" />}
        {wrapped && <WrapperEar color={earColors[variant]} side="right" />}
        {isLoading ? <span>Chờ xíu nhé…</span> : children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
