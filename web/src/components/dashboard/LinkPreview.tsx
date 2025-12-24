"use client";

import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcon";
import { Link, SocialLink } from "@/lib/api/links";
import { User } from "@/lib/api/auth";
import { DEFAULT_BACKGROUND_COLOR } from "@/lib/constants/colors";

interface LinkPreviewProps {
  profile: User | null;
  links: Link[];
  socialLinks: SocialLink[];
}

// 미리보기 전용 컴포넌트 - 대시보드에서 실제 링크 페이지가 어떻게 보일지 표시
export function LinkPreview({ profile, links, socialLinks }: LinkPreviewProps) {
  // 활성화된 링크만 필터링
  const activeLinks = links.filter((link) => link.is_active);
  const activeSocialLinks = socialLinks.filter((link) => link.is_active);

  // 사용자가 설정한 배경색 사용 (없으면 기본 화이트)
  const bgColor = profile?.background_color || DEFAULT_BACKGROUND_COLOR;

  return (
    <div
      className="relative mx-auto h-[600px] w-[280px] overflow-hidden rounded-[40px] border-[8px] border-gray-800 shadow-xl"
      style={{ backgroundColor: bgColor }}>
      {/* 모바일 상단 노치 */}
      <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-gray-800" />
      
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="h-full overflow-y-auto pt-8">
        <div className="px-4 pb-6">
          {/* 프로필 섹션 */}
          <section className="flex flex-col items-center py-4">
            <Avatar
              src={profile?.profile_image_url || "/avatar-placeholder.jpg"}
              alt={profile?.display_name || profile?.username || "User"}
              className="h-[60px] w-[60px]"
            />
            <h2 className="mt-2 text-center text-sm font-bold text-gray-900">
              {profile?.display_name || profile?.username || "Display Name"}
            </h2>
            {profile?.bio && (
              <p className="mt-1 text-center text-xs text-gray-600 line-clamp-2">
                {profile.bio}
              </p>
            )}
          </section>

          {/* SNS 링크 섹션 */}
          {activeSocialLinks.length > 0 && (
            <section className="py-2">
              <div className="flex items-center justify-center gap-2">
                {activeSocialLinks.map((social) => (
                  <div
                    key={social.id}
                    className="cursor-default transition-transform hover:scale-110"
                  >
                    <SocialPlatformIcon
                      platform={social.platform}
                      size="sm"
                      showBackground
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 링크 섹션 */}
          <section className="flex flex-col gap-2 py-3">
            {activeLinks.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">
                활성화된 링크가 없습니다
              </div>
            ) : (
              activeLinks.map((link) => (
                <button
                  key={link.id}
                  className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow"
                >
                  {link.title}
                </button>
              ))
            )}
          </section>

          {/* 푸터 */}
          <footer className="mt-4 text-center">
            <p className="text-[10px] text-gray-400">
              PPOPLINK
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

