"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { NameInput } from "@/components/NameInput";
import { usePlayer } from "@/contexts/PlayerContext";
import { Difficulty } from "@/lib/sudoku";

const difficultyOptions = [
  { value: "easy", label: "🟢 Dễ" },
  { value: "medium", label: "🟡 Trung bình" },
  { value: "hard", label: "🔴 Khó" },
];

interface CreateRoomFormProps {
  onCancel?: () => void;
}

export function CreateRoomForm({ onCancel }: CreateRoomFormProps) {
  const router = useRouter();
  const { player, setGuestName } = usePlayer();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"name" | "create">(player ? "create" : "name");

  const handleNameSubmit = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/player/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create session");
        }

        const data = await response.json();
        setGuestName(data.name, data.visitorId);
        setStep("create");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setIsLoading(false);
      }
    },
    [setGuestName]
  );

  const handleCreateRoom = useCallback(async () => {
    if (!player) {
      setStep("name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: player.visitorId,
          hostName: player.name,
          difficulty,
          userId: player.oderId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create room");
      }

      const data = await response.json();
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      setIsLoading(false);
    }
  }, [player, difficulty, router]);

  if (step === "name") {
    return (
      <div className="space-y-4">
        <NameInput
          onSubmit={handleNameSubmit}
          buttonText="Tiếp tục"
          isLoading={isLoading}
        />
        {error && (
          <p className="text-sm text-error-500 text-center">{error}</p>
        )}
        {onCancel && (
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Hủy
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <p className="text-gray-600">
          Xin chào, <span className="font-semibold">{player?.name}</span>!
        </p>
      </div>

      <Select
        label="Độ khó"
        options={difficultyOptions}
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
      />

      {error && (
        <p className="text-sm text-error-500 text-center">{error}</p>
      )}

      <Button
        onClick={handleCreateRoom}
        fullWidth
        size="lg"
        isLoading={isLoading}
      >
        🚀 Tạo phòng
      </Button>

      {onCancel && (
        <Button variant="ghost" fullWidth onClick={onCancel}>
          Hủy
        </Button>
      )}
    </motion.div>
  );
}
