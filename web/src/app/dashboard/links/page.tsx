"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
import { PASTEL_COLORS } from "@/lib/constants/colors";

// 다중 선택 소셜 링크 상태 타입
interface SelectedPlatform {
  platform: string;
  url: string;
}

export default function LinksPage() {
  const { links, socialLinks, isLoading, error, fetchLinks, fetchSocialLinks, createLink, clearError, createSocialLink, updateSocialLink, deleteSocialLink } =
    useLinksStore();
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, updateProfile, uploadProfileImage, clearError: clearProfileError } = useProfileStore();
  
  // 프로필 이미지 업로드를 위한 ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // 저장 중 상태 (개별 필드별)
  const [savingField, setSavingField] = useState<string | null>(null);

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

  // 개별 프로필 필드 저장 핸들러
  const handleSaveProfileField = useCallback(async (field: keyof typeof formData) => {
    if (savingField) return;
    setSavingField(field);
    try {
      await updateProfile({ [field]: formData[field] });
    } catch (error) {
      console.error(`Failed to save ${field}:`, error);
    } finally {
      setSavingField(null);
    }
  }, [formData, updateProfile, savingField]);

  // 배경 색상 변경 및 저장
  const handleBackgroundColorChange = async (color: string) => {
    setFormData((prev) => ({ ...prev, background_color: color }));
    setSavingField("background_color");
    try {
      await updateProfile({ background_color: color });
    } catch (error) {
      console.error("Failed to save background color:", error);
    } finally {
      setSavingField(null);
    }
  };

  // 소셜 링크 추가 저장 (개별)
  const handleSaveSocialLink = async (platform: SelectedPlatform) => {
    if (!platform.url.trim()) return;
    setSavingField(`social-${platform.platform}`);
    try {
      await createSocialLink({
        platform: platform.platform,
        url: platform.url,
      });
      // 저장 성공 시 해당 플랫폼 선택 목록에서 제거
      setSelectedPlatforms((prev) => prev.filter((p) => p.platform !== platform.platform));
    } catch (error) {
      console.error("Failed to save social link:", error);
    } finally {
      setSavingField(null);
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
    setSavingField(`edit-${id}`);
    try {
      await updateSocialLink(id, { url: editingUrl });
      setEditingSocialId(null);
      setEditingUrl("");
    } catch (error) {
      console.error("Failed to update social link:", error);
    } finally {
      setSavingField(null);
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
    try {
      await deleteSocialLink(id);
    } catch (error) {
      console.error("Failed to delete social link:", error);
    }
  };

  // 프로필 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSavingField("profile_image");
    try {
      await uploadProfileImage(file);
    } catch (error) {
      console.error("Failed to upload profile image:", error);
    } finally {
      setSavingField(null);
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 미리보기용 프로필 객체 (로컬 formData 반영)
  const previewProfile = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      display_name: formData.display_name,
      bio: formData.bio,
      background_color: formData.background_color,
    };
  }, [profile, formData.display_name, formData.bio, formData.background_color]);

  // 이미 추가된 플랫폼 목록
  const addedPlatforms = socialLinks.map((link) => link.platform.toLowerCase());

  // 추가 가능한 플랫폼 (아직 추가되지 않은 것들)
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !addedPlatforms.includes(p.id)
  );

  // 미리보기용 소셜 링크 (기존 + 선택 중인 것 합침)
  const previewSocialLinks = [
    ...socialLinks,
    ...selectedPlatforms.map((p, idx) => ({
      id: `preview-${p.platform}-${idx}`,
      platform: p.platform,
      url: p.url || `https://${p.platform}.com`,
      is_active: true,
      display_order: socialLinks.length + idx,
    })),
  ];

  // 미리보기용 링크 (기존 + 모달에서 입력 중인 것 합침)
  const previewLinks = [
    ...links,
    // 모달이 열려있고 제목과 URL이 있을 때만 미리보기에 추가
    ...(isModalOpen && newLink.title.trim() ? [{
      id: `preview-new-link`,
      user_id: "",
      title: newLink.title,
      url: newLink.url || "#",
      thumbnail_url: null,
      display_order: links.length,
      is_active: true,
      click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: null,
    }] : []),
  ];

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
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">내 페이지 편집</h1>
          <p className="mt-1 text-sm text-gray-600">
            프로필과 링크를 한 곳에서 관리하세요 (Enter 키로 각 항목 저장)
          </p>
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
                    size={48}
                  />
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      variant="secondary" 
                      className="text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={savingField === "profile_image"}
                    >
                      {savingField === "profile_image" ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <p className="mt-1 text-[10px] text-gray-500">
                      JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveProfileField("display_name");
                    }
                  }}
                  placeholder="이름을 입력하세요 (Enter로 저장)"
                  disabled={savingField === "display_name"}
                />

                <Textarea
                  label="소개"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSaveProfileField("bio");
                    }
                  }}
                  placeholder="자기소개를 작성하세요 (Ctrl+Enter로 저장)"
                  rows={2}
                  disabled={savingField === "bio"}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    배경 색상 {savingField === "background_color" && <span className="text-xs text-gray-500">(저장 중...)</span>}
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PASTEL_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleBackgroundColorChange(color.hex)}
                        disabled={savingField === "background_color"}
                        className={`h-8 w-8 rounded-md border-2 transition-all hover:scale-105 ${
                          formData.background_color.toLowerCase() === color.hex.toLowerCase()
                            ? "border-primary ring-2 ring-primary/30 scale-110"
                            : "border-gray-200 hover:border-gray-300"
                        } ${savingField === "background_color" ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.nameKo}
                      />
                    ))}
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
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUpdateSocialLink(link.id);
                                  } else if (e.key === "Escape") {
                                    setEditingSocialId(null);
                                    setEditingUrl("");
                                  }
                                }}
                                className="flex-1 rounded border border-gray-300 px-1.5 py-0.5 text-[10px]"
                                placeholder="https://... (Enter로 저장)"
                                disabled={savingField === `edit-${link.id}`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateSocialLink(link.id)}
                                disabled={savingField === `edit-${link.id}`}
                                className="text-[10px] text-blue-600 hover:text-blue-700 disabled:opacity-50"
                              >
                                {savingField === `edit-${link.id}` ? "..." : "OK"}
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
                      URL 입력 후 Enter로 저장 ({selectedPlatforms.length}개 선택됨)
                    </p>
                    {selectedPlatforms.map((selected) => {
                      const isSavingThis = savingField === `social-${selected.platform}`;
                      return (
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveSocialLink(selected);
                              }
                            }}
                            placeholder={`https://${selected.platform}.com/username (Enter로 저장)`}
                            className="flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                            disabled={isSavingThis}
                          />
                          {isSavingThis ? (
                            <span className="text-xs text-blue-500">저장중...</span>
                          ) : (
                            <button
                              onClick={() => handleTogglePlatform(selected.platform)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              X
                            </button>
                          )}
                        </div>
                      );
                    })}
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
            profile={previewProfile}
            links={previewLinks}
            socialLinks={previewSocialLinks}
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
