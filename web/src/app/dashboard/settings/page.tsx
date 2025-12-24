"use client";

import React, { useEffect, useState } from "react";
import { useProfileStore } from "@/store/profileStore";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { DEFAULT_BACKGROUND_COLOR } from "@/lib/constants/colors";

export default function SettingsPage() {
  const { profile, isLoading, error, fetchProfile, updateProfile, uploadProfileImage } =
    useProfileStore();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 프로필 데이터 로드
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 프로필 데이터가 로드되면 폼에 반영
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setBackgroundColor(profile.background_color || DEFAULT_BACKGROUND_COLOR);
    }
  }, [profile]);

  // 프로필 저장 핸들러
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateProfile({
        display_name: displayName || undefined,
        bio: bio || undefined,
        background_color: backgroundColor,
      });
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err) {
      setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  // 프로필 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadProfileImage(file);
      setSaveMessage({ type: "success", text: "Profile image updated!" });
    } catch (err) {
      setSaveMessage({ type: "error", text: "Failed to upload image. Please try again." });
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Customize your profile and appearance</p>
      </div>

      {/* 성공/에러 메시지 */}
      {saveMessage && (
        <div
          className={`rounded-lg p-4 ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* 프로필 이미지 섹션 */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile Image</h2>
        <div className="flex items-center gap-6">
          <Avatar
            src={profile?.profile_image_url || "/avatar-placeholder.jpg"}
            alt={profile?.display_name || profile?.username || "Profile"}
            size={80}
          />
          <div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
                Change Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG, GIF (max 5MB)
            </p>
          </div>
        </div>
      </section>

      {/* 기본 정보 섹션 */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={100}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              maxLength={500}
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">
              {bio.length}/500 characters
            </p>
          </div>
        </div>
      </section>

      {/* 배경색 섹션 */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Background Color</h2>
        <p className="mb-4 text-sm text-gray-600">
          Choose a pastel background color for your profile page
        </p>

        {/* 컬러 팔레트 */}
        <ColorPicker
          selectedColor={backgroundColor}
          onColorSelect={setBackgroundColor}
          disabled={isSaving}
        />
      </section>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            if (profile) {
              setDisplayName(profile.display_name || "");
              setBio(profile.bio || "");
              setBackgroundColor(profile.background_color || DEFAULT_BACKGROUND_COLOR);
            }
          }}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
