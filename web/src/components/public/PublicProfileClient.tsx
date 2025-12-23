"use client";

import React from "react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Avatar } from "@/components/ui/Avatar";
import { PublicProfile } from "@/lib/api/public";
import { PublicLinkButton } from "./PublicLinkButton";
import { SocialIcons } from "./SocialIcons";

interface PublicProfileClientProps {
  profile: PublicProfile;
}

export function PublicProfileClient({ profile }: PublicProfileClientProps) {
  const activeLinks = profile.links.filter((link) => link.is_active);
  const activeSocialLinks = profile.social_links.filter(
    (link) => link.is_active
  );

  return (
    <main className="min-h-screen bg-white py-8 sm:py-12 md:py-16">
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

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Create your own link in bio with{" "}
            <a
              href="/"
              className="font-semibold text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              PPOP LinkBio
            </a>
          </p>
        </footer>
      </MobileContainer>
    </main>
  );
}

