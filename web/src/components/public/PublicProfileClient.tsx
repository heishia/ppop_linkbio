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
            <p className="mt-2 text-center font-normal text-bio">
              {profile.bio}
            </p>
          )}
        </section>

        {/* Social Links */}
        {activeSocialLinks.length > 0 && (
          <SocialIcons socialLinks={activeSocialLinks} />
        )}

        {/* Links */}
        <section className="flex flex-col gap-4 py-6">
          {activeLinks.map((link) => (
            <PublicLinkButton key={link.id} link={link} username={profile.username} />
          ))}
        </section>

        {/* PPOPLINK 워터마크 푸터 - 무료 사용자용 */}
        <footer className="mt-12 flex flex-col items-center pb-8">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center transition-transform hover:scale-105"
          >
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              PPOPLINK
            </span>
            <span className="mt-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
              Create your own link bio
            </span>
          </a>
        </footer>
      </MobileContainer>
    </main>
  );
}
