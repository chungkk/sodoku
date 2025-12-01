"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileCardProps {
  displayName: string;
  email: string;
  createdAt: string;
  onUpdateProfile: (data: { displayName?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
}

export function ProfileCard({
  displayName,
  email,
  createdAt,
  onUpdateProfile,
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: displayName,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.displayName.length < 2 || formData.displayName.length > 20) {
      setError("Tên hiển thị phải từ 2-20 ký tự");
      return;
    }

    setIsLoading(true);

    const updateData: { displayName?: string; password?: string } = {};
    if (formData.displayName !== displayName) {
      updateData.displayName = formData.displayName;
    }
    if (formData.password) {
      updateData.password = formData.password;
    }

    if (Object.keys(updateData).length === 0) {
      setIsLoading(false);
      setIsEditing(false);
      return;
    }

    const result = await onUpdateProfile(updateData);
    setIsLoading(false);

    if (result.success) {
      setSuccess("Cập nhật thành công!");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setIsEditing(false);
    } else {
      setError(result.error || "Cập nhật thất bại");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-lg text-primary">THÔNG TIN</h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="font-retro"
          >
            SỬA
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="font-retro text-sm">
              Tên hiển thị
            </Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-retro text-sm">
              Mật khẩu mới (để trống nếu không đổi)
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-background border-border"
            />
          </div>

          {formData.password && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-retro text-sm">
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-background border-border"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 text-destructive text-sm font-retro">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="font-retro"
            >
              {isLoading ? "ĐANG LƯU..." : "LƯU"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  displayName,
                  password: "",
                  confirmPassword: "",
                });
                setError(null);
              }}
              disabled={isLoading}
              className="font-retro"
            >
              HỦY
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {success && (
            <div className="p-3 bg-primary/10 border border-primary/50 text-primary text-sm font-retro">
              {success}
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground font-retro text-sm">Tên:</span>
            <span className="font-retro">{displayName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-retro text-sm">Email:</span>
            <span className="font-retro text-sm">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-retro text-sm">Tham gia:</span>
            <span className="font-retro text-sm">{formatDate(createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
