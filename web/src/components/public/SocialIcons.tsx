import React from "react";
import { SocialLink } from "@/lib/api/links";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcon";

interface SocialIconsProps {
  socialLinks: SocialLink[];
}

// SNS 아이콘 최대 개수 제한
const MAX_SOCIAL_ICONS = 5;

export function SocialIcons({ socialLinks }: SocialIconsProps) {
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 최대 5개까지만 표시
  const displayedLinks = socialLinks.slice(0, MAX_SOCIAL_ICONS);

  return (
    <section className="py-4">
      <div className="flex items-center justify-center gap-3">
        {displayedLinks.map((social) => (
          <button
            key={social.id}
            onClick={() => handleSocialClick(social.url)}
            className="transition-transform hover:scale-110"
            aria-label={`Visit ${social.platform} profile`}
          >
            <SocialPlatformIcon
              platform={social.platform}
              size="md"
              showBackground
            />
          </button>
        ))}
      </div>
    </section>
  );
}
