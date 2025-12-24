"use client";

import React from "react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Avatar } from "@/components/ui/Avatar";
import { PublicProfile } from "@/lib/api/public";
import { PublicLinkButton } from "./PublicLinkButton";
import { SocialIcons } from "./SocialIcons";
import { DEFAULT_BACKGROUND_COLOR } from "@/lib/constants/colors";

interface PublicProfileClientProps {
  profile: PublicProfile;
}

export function PublicProfileClient({ profile }: PublicProfileClientProps) {
  const activeLinks = profile.links.filter((link) => link.is_active);
  const activeSocialLinks = profile.social_links.filter(
    (link) => link.is_active
  );

  // 사용자가 설정한 배경색 사용 (없으면 기본 화이트)
  const bgColor = profile.background_color || DEFAULT_BACKGROUND_COLOR;

  return (
    <main
      className="min-h-screen py-8 sm:py-12 md:py-16"
      style={{ backgroundColor: bgColor }}
    >
      <MobileContainer>
        {/* Profile Section */}
        <section className="flex flex-col items-center py-8">
          <Avatar
            src={profile.profile_image_url || "/avatar-placeholder.jpg"}
            alt={profile.display_name || profile.username}
          />
          <h1 className="mt-4 text-center font-extrabold text-username">
            {profile.display_name || profile.username}
          </h1>
          {profile.bio && (
            <p className="mt-2 text-center font-normal text-bio whitespace-pre-line">
              {profile.bio}
            </p>
          )}
        </section>

        {/* Social Links */}
        {activeSocialLinks.length > 0 && (
          <SocialIcons socialLinks={activeSocialLinks} />
        )}

        {/* Links */}
        <section className="flex flex-col gap-4 py-6 pb-16">
          {activeLinks.map((link) => (
            <PublicLinkButton key={link.id} link={link} publicLinkId={profile.public_link_id} />
          ))}
        </section>
      </MobileContainer>

      {/* PPOPLINK 워터마크 푸터 - 무료 사용자용, 하단 고정 */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center py-3 pointer-events-none">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto text-2xl sm:text-3xl font-bold text-primary/50 transition-all hover:text-primary hover:scale-105"
        >
          PPOPLINK
        </a>
      </footer>
    </main>
  );
}
