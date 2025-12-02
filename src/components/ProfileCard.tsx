"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ProfileCardProps {
  displayName: string;
  email: string;
  createdAt: string;
  isGuest?: boolean;
}

export const ProfileCard = memo(function ProfileCard({
  displayName,
  email,
  createdAt,
  isGuest = false,
}: ProfileCardProps) {
  const joinDate = new Date(createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card padding="lg" className="text-center">
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-4xl">
            {isGuest ? "👤" : "🎮"}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h2>
        
        {!isGuest && (
          <p className="text-gray-500 mb-4">{email}</p>
        )}

        {isGuest ? (
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            Khách
          </span>
        ) : (
          <p className="text-sm text-gray-500">
            Tham gia từ {joinDate}
          </p>
        )}
      </Card>
    </motion.div>
  );
});
