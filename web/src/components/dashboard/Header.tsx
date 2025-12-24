"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleViewProfile = () => {
    if (user?.username) {
      window.open(`/${user.username}`, "_blank");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">대시보드</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={handleViewProfile}
          className="text-sm"
        >
          프로필 공유
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.display_name || user?.username}
            </p>
            <p className="text-xs text-gray-500">@{user?.username}</p>
          </div>
          <Avatar
            src={user?.profile_image_url || "/avatar-placeholder.jpg"}
            alt={user?.username || "User"}
            className="h-10 w-10"
          />
        </div>

        <Button
          variant="tertiary"
          onClick={handleLogout}
          className="text-sm"
        >
          로그아웃
        </Button>
      </div>
    </header>
  );
}
