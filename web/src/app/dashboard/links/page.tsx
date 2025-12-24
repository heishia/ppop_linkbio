"use client";

import React, { useEffect, useState } from "react";
import { useLinksStore } from "@/store/linksStore";
import { useProfileStore } from "@/store/profileStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";
import { Switch } from "@/components/ui/Switch";
import { LinkItem } from "@/components/dashboard/LinkItem";
import { LinkPreview } from "@/components/dashboard/LinkPreview";
import {
  SocialPlatformIcon,
  SOCIAL_PLATFORMS,
} from "@/components/ui/SocialPlatformIcon";

// 다중 선택 소셜 링크 상태 타입
interface SelectedPlatform {
  platform: string;
  url: string;
}

export default function LinksPage() {
  const { links, socialLinks, isLoading, error, fetchLinks, fetchSocialLinks, createLink, clearError, createSocialLink, updateSocialLink, deleteSocialLink } =
    useLinksStore();
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, updateProfile, clearError: clearProfileError } = useProfileStore();
  
  // 링크 추가 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    url?: string;
  }>({});

  // 프로필 폼 상태
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    background_color: "#ffffff",
  });

  // 다중 선택된 플랫폼 상태
  const [selectedPlatforms, setSelectedPlatforms] = useState<SelectedPlatform[]>([]);
  
  // 편집 중인 소셜 링크 상태
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
    fetchSocialLinks();
    fetchProfile();
  }, [fetchLinks, fetchSocialLinks, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        background_color: profile.background_color || "#ffffff",
      });
    }
  }, [profile]);

  const validateForm = () => {
    const errors: { title?: string; url?: string } = {};

    if (!newLink.title.trim()) {
      errors.title = "제목을 입력해주세요";
    }

    if (!newLink.url.trim()) {
      errors.url = "URL을 입력해주세요";
    } else if (
      !/^https?:\/\/.+/.test(newLink.url)
    ) {
      errors.url = "URL은 http:// 또는 https://로 시작해야 합니다";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLink = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createLink(newLink);
      setIsModalOpen(false);
      setNewLink({ title: "", url: "" });
      setFormErrors({});
    } catch (error) {
      console.error("Failed to create link:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewLink({ title: "", url: "" });
    setFormErrors({});
    clearError();
  };

  // 통합 저장 - 프로필 정보 + 선택된 소셜 링크 모두 저장
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 프로필 정보 저장
      await updateProfile(formData);

      // 선택된 소셜 링크들 추가 (URL이 있는 것만)
      const validPlatforms = selectedPlatforms.filter(p => p.url.trim());
      for (const platform of validPlatforms) {
        await createSocialLink({
          platform: platform.platform,
          url: platform.url,
        });
      }

      // 선택 초기화
      setSelectedPlatforms([]);
      alert("Successfully saved!");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // 플랫폼 토글 선택/해제
  const handleTogglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const existing = prev.find(p => p.platform === platformId);
      if (existing) {
        return prev.filter(p => p.platform !== platformId);
      } else {
        return [...prev, { platform: platformId, url: "" }];
      }
    });
  };

  // 선택된 플랫폼의 URL 업데이트
  const handleUpdateSelectedUrl = (platformId: string, url: string) => {
    setSelectedPlatforms(prev =>
      prev.map(p =>
        p.platform === platformId ? { ...p, url } : p
      )
    );
  };

  // 소셜 링크 업데이트 (기존 링크)
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

  // 변경사항이 있는지 확인
  const hasChanges = 
    (profile && (
      formData.display_name !== (profile.display_name || "") ||
      formData.bio !== (profile.bio || "") ||
      formData.background_color !== (profile.background_color || "#ffffff")
    )) || selectedPlatforms.length > 0;

  if ((isLoading || profileLoading) && links.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 왼쪽: 설정 영역 */}
      <div className="flex-1 space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 페이지 편집</h1>
            <p className="mt-1 text-sm text-gray-600">
              프로필과 링크를 한 곳에서 관리하세요
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            className="px-6"
          >
            {isSaving ? "저장 중..." : "전체 저장"}
          </Button>
        </div>

        {(error || profileError) && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error || profileError}
          </div>
        )}

        {/* 프로필 설정 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">프로필 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {/* 프로필 정보 */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={profile?.profile_image_url || "/avatar-placeholder.jpg"}
                    alt={profile?.username || "User"}
                    className="h-12 w-12"
                  />
                  <Button variant="secondary" className="text-xs">
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
                  placeholder="이름을 입력하세요"
                />

                <Textarea
                  label="소개"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="자기소개를 작성하세요"
                  rows={2}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    배경 색상
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          background_color: e.target.value,
                        }))
                      }
                      className="h-9 w-9 cursor-pointer rounded-lg border border-gray-300"
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
              </div>

              {/* 구분선 */}
              <div className="w-px bg-gray-200" />

              {/* SNS 아이콘 설정 */}
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">SNS 아이콘</h3>
                
                {/* 기존 소셜 링크 목록 */}
                {socialLinks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {socialLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5"
                      >
                        <SocialPlatformIcon
                          platform={link.platform}
                          size="sm"
                          showBackground
                        />

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-gray-900">
                            {SOCIAL_PLATFORMS.find(
                              (p) => p.id === link.platform.toLowerCase()
                            )?.name || link.platform}
                          </div>
                          {editingSocialId === link.id ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <input
                                type="url"
                                value={editingUrl}
                                onChange={(e) => setEditingUrl(e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-1.5 py-0.5 text-[10px]"
                                placeholder="https://..."
                              />
                              <button
                                onClick={() => handleUpdateSocialLink(link.id)}
                                className="text-[10px] text-blue-600 hover:text-blue-700"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSocialId(null);
                                  setEditingUrl("");
                                }}
                                className="text-[10px] text-gray-500 hover:text-gray-700"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-500 truncate">
                              {link.url}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {editingSocialId !== link.id && (
                            <button
                              onClick={() => {
                                setEditingSocialId(link.id);
                                setEditingUrl(link.url);
                              }}
                              className="text-[10px] text-gray-400 hover:text-gray-600"
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
                            className="text-[10px] text-red-400 hover:text-red-600"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 플랫폼 다중 선택 그리드 */}
                {availablePlatforms.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">
                      아이콘 추가 (다중선택)
                    </p>
                    <div className="grid grid-cols-5 gap-1">
                      {availablePlatforms.map((platform) => {
                        const isSelected = selectedPlatforms.some(
                          (p) => p.platform === platform.id
                        );
                        return (
                          <button
                            key={platform.id}
                            onClick={() => handleTogglePlatform(platform.id)}
                            className={`flex flex-col items-center gap-0.5 rounded-lg border p-1 transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                            title={platform.name}
                          >
                            <SocialPlatformIcon
                              platform={platform.id}
                              size="sm"
                              showBackground
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 선택된 플랫폼들의 URL 입력 */}
                {selectedPlatforms.length > 0 && (
                  <div className="space-y-1.5 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-700">
                      URL 입력 ({selectedPlatforms.length}개 선택됨)
                    </p>
                    {selectedPlatforms.map((selected) => (
                      <div key={selected.platform} className="flex items-center gap-1.5">
                        <SocialPlatformIcon
                          platform={selected.platform}
                          size="sm"
                          showBackground
                        />
                        <input
                          type="url"
                          value={selected.url}
                          onChange={(e) =>
                            handleUpdateSelectedUrl(selected.platform, e.target.value)
                          }
                          placeholder={`https://${selected.platform}.com/username`}
                          className="flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleTogglePlatform(selected.platform)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 링크 관리 카드 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">링크 관리</CardTitle>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              링크 추가
            </Button>
          </CardHeader>
          <CardContent className="py-2">
            {links.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-gray-600 text-sm">아직 링크가 없습니다</p>
                <p className="mt-1 text-xs text-gray-500">
                  "링크 추가" 버튼을 클릭하여 첫 번째 링크를 만들어보세요
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {links.map((link) => (
                  <LinkItem key={link.id} link={link} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽: 미리보기 영역 */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <h2 className="mb-4 text-center text-sm font-medium text-gray-500">
            미리보기
          </h2>
          <LinkPreview
            profile={profile}
            links={links}
            socialLinks={socialLinks}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="새 링크 추가"
      >
        <div className="space-y-4">
          <Input
            label="제목"
            value={newLink.title}
            onChange={(e) =>
              setNewLink((prev) => ({ ...prev, title: e.target.value }))
            }
            error={formErrors.title}
            placeholder="My awesome link"
          />
          <Input
            label="URL"
            value={newLink.url}
            onChange={(e) =>
              setNewLink((prev) => ({ ...prev, url: e.target.value }))
            }
            error={formErrors.url}
            placeholder="https://example.com"
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleCreateLink}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "생성 중..." : "링크 만들기"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
