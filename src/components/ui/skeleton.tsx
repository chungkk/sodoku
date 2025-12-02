"use client";

import { memo } from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

export const Skeleton = memo(function Skeleton({
  className = "",
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  const roundedClass = {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-gray-200 ${roundedClass} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
});

export const SkeletonText = memo(function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(lines)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            height={16}
            width={i === lines - 1 ? "60%" : "100%"}
            rounded="sm"
          />
        ))}
    </div>
  );
});

export const SkeletonCard = memo(function SkeletonCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
      <Skeleton height={24} width="40%" className="mb-4" />
      <SkeletonText lines={3} />
      <Skeleton height={40} className="mt-4" />
    </div>
  );
});

export const SkeletonBoard = memo(function SkeletonBoard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-9 gap-0.5 bg-gray-300 p-0.5 rounded-xl ${className}`}>
      {Array(81)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square"
            rounded="sm"
          />
        ))}
    </div>
  );
});

export const SkeletonProfile = memo(function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <Skeleton width={80} height={80} rounded="full" className="mx-auto mb-4" />
        <Skeleton height={28} width="50%" className="mx-auto mb-2" />
        <Skeleton height={16} width="40%" className="mx-auto" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <Skeleton height={24} width="30%" className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <Skeleton height={36} width="50%" className="mx-auto mb-2" />
                <Skeleton height={14} width="70%" className="mx-auto" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});
