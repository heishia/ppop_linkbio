"use client";

import React, { useEffect, useState } from "react";
import { useProfileStore } from "@/store/profileStore";
import { useLinksStore } from "@/store/linksStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Switch } from "@/components/ui/Switch";
import {
  SocialPlatformIcon,
  SOCIAL_PLATFORMS,
} from "@/components/ui/SocialPlatformIcon";

// 소셜 링크 폼 상태 타입
interface SocialLinkForm {
  platform: string;
  url: string;
  isEditing: boolean;
}

export default function AppearancePage() {
  const { profile, isLoading, error, fetchProfile, updateProfile, clearError } =
    useProfileStore();

  const {
    socialLinks,
    fetchSocialLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
  } = useLinksStore();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    background_color: "#ffffff",
  });

  // 소셜 링크 추가 모달 상태
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [newSocialLink, setNewSocialLink] = useState<SocialLinkForm>({
    platform: "",
    url: "",
    isEditing: false,
  });

  // 편집 중인 소셜 링크 상태
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchSocialLinks();
  }, [fetchProfile, fetchSocialLinks]);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        background_color: profile.background_color || "#ffffff",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // 소셜 링크 추가
  const handleAddSocialLink = async () => {
    if (!newSocialLink.platform || !newSocialLink.url) return;

    try {
      await createSocialLink({
        platform: newSocialLink.platform,
        url: newSocialLink.url,
      });
      setNewSocialLink({ platform: "", url: "", isEditing: false });
      setShowAddSocial(false);
    } catch (error) {
      console.error("Failed to add social link:", error);
    }
  };

  // 소셜 링크 업데이트
  const handleUpdateSocialLink = async (id: string) => {
    try {
      await updateSocialLink(id, { url: editingUrl });
      setEditingSocialId(null);
      setEditingUrl("");
    } catch (error) {
      console.error("Failed to update social link:", error);
    }
  };

  // 소셜 링크 활성화/비활성화 토글
  const handleToggleSocialLink = async (id: string, currentActive: boolean) => {
    try {
      await updateSocialLink(id, { is_active: !currentActive });
    } catch (error) {
      console.error("Failed to toggle social link:", error);
    }
  };

  // 소셜 링크 삭제
  const handleDeleteSocialLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this social link?")) return;

    try {
      await deleteSocialLink(id);
    } catch (error) {
      console.error("Failed to delete social link:", error);
    }
  };

  // 이미 추가된 플랫폼 목록
  const addedPlatforms = socialLinks.map((link) => link.platform.toLowerCase());

  // 추가 가능한 플랫폼 (아직 추가되지 않은 것들)
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !addedPlatforms.includes(p.id)
  );

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // 활성화된 소셜 링크만 미리보기용
  const activeSocialLinks = socialLinks.filter((link) => link.is_active);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">외관</h1>
        <p className="mt-1 text-sm text-gray-600">
          프로필의 모양을 커스터마이즈하세요
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  src={profile?.profile_image_url || "/avatar-placeholder.jpg"}
                  alt={profile?.username || "User"}
                />
                <Button variant="secondary" className="text-sm">
                  사진 업로드
                </Button>
              </div>

              <Input
                label="표시 이름"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Your Name"
              />

              <Textarea
                label="소개"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Write something about yourself"
                rows={4}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  배경색
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        background_color: e.target.value,
                      }))
                    }
                    className="h-12 w-12 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        background_color: e.target.value,
                      }))
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* SNS 아이콘 설정 섹션 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>SNS 아이콘</CardTitle>
              {availablePlatforms.length > 0 && (
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={() => setShowAddSocial(true)}
                >
                  + 추가
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-500">
                프로필 아래에 수평으로 표시될 SNS 아이콘을 설정하세요
              </p>

              {/* 추가된 소셜 링크 목록 */}
              {socialLinks.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  SNS 아이콘이 없습니다. 추가 버튼을 눌러 추가하세요.
                </div>
              ) : (
                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <SocialPlatformIcon
                        platform={link.platform}
                        size="md"
                        showBackground
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">
                          {
                            SOCIAL_PLATFORMS.find(
                              (p) =>
                                p.id === link.platform.toLowerCase()
                            )?.name || link.platform
                          }
                        </div>
                        {editingSocialId === link.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="url"
                              value={editingUrl}
                              onChange={(e) => setEditingUrl(e.target.value)}
                              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                              placeholder="https://..."
                            />
                            <button
                              onClick={() => handleUpdateSocialLink(link.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingSocialId(null);
                                setEditingUrl("");
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 truncate">
                            {link.url}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {editingSocialId !== link.id && (
                          <button
                            onClick={() => {
                              setEditingSocialId(link.id);
                              setEditingUrl(link.url);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Edit
                          </button>
                        )}
                        <Switch
                          checked={link.is_active}
                          onChange={() =>
                            handleToggleSocialLink(link.id, link.is_active)
                          }
                          label=""
                        />
                        <button
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 플랫폼 추가 - 좌우 레이아웃 */}
              {showAddSocial && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex gap-4">
                    {/* 왼쪽: 플랫폼 선택 그리드 */}
                    <div className="flex-shrink-0">
                      <h4 className="mb-2 text-xs font-semibold text-gray-500">
                        플랫폼 선택
                      </h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {availablePlatforms.map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() =>
                              setNewSocialLink((prev) => ({
                                ...prev,
                                platform: platform.id,
                              }))
                            }
                            className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 transition-colors ${
                              newSocialLink.platform === platform.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                            title={platform.name}
                          >
                            <SocialPlatformIcon
                              platform={platform.id}
                              size="sm"
                              showBackground
                            />
                            <span className="text-[8px] text-gray-500 truncate max-w-[40px]">
                              {platform.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 오른쪽: URL 입력 및 버튼 */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      {newSocialLink.platform ? (
                        <>
                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <SocialPlatformIcon
                                platform={newSocialLink.platform}
                                size="sm"
                                showBackground
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {SOCIAL_PLATFORMS.find(
                                  (p) => p.id === newSocialLink.platform
                                )?.name}
                              </span>
                            </div>
                            <Input
                              label="URL"
                              type="url"
                              value={newSocialLink.url}
                              onChange={(e) =>
                                setNewSocialLink((prev) => ({
                                  ...prev,
                                  url: e.target.value,
                                }))
                              }
                              placeholder={`https://${newSocialLink.platform}.com/username`}
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="primary"
                              onClick={handleAddSocialLink}
                              className="flex-1"
                              disabled={!newSocialLink.url}
                            >
                              추가
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setShowAddSocial(false);
                                setNewSocialLink({
                                  platform: "",
                                  url: "",
                                  isEditing: false,
                                });
                              }}
                            >
                              취소
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          왼쪽에서 플랫폼을 선택하세요
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>테마</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                테마 커스터마이징 기능이 곧 제공됩니다...
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border border-gray-200 p-6"
                style={{ backgroundColor: formData.background_color }}
              >
                <div className="flex flex-col items-center">
                  <Avatar
                    src={
                      profile?.profile_image_url || "/avatar-placeholder.jpg"
                    }
                    alt={profile?.username || "User"}
                  />
                  <h2 className="mt-4 text-center font-extrabold text-username">
                    {formData.display_name || profile?.username || "Username"}
                  </h2>
                  {formData.bio && (
                    <p className="mt-2 text-center font-normal text-bio">
                      {formData.bio}
                    </p>
                  )}

                  {/* SNS 아이콘 미리보기 */}
                  {(activeSocialLinks.length > 0 || newSocialLink.platform) && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      {activeSocialLinks.map((link) => (
                        <SocialPlatformIcon
                          key={link.id}
                          platform={link.platform}
                          size="md"
                          showBackground
                          className="cursor-pointer"
                        />
                      ))}
                      {/* 선택 중인 플랫폼 미리보기 (점선 테두리로 구분) */}
                      {newSocialLink.platform && (
                        <div className="relative">
                          <SocialPlatformIcon
                            platform={newSocialLink.platform}
                            size="md"
                            showBackground
                            className="opacity-70"
                          />
                          <div className="absolute -inset-1 rounded-full border-2 border-dashed border-blue-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
