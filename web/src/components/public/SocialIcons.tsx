import React from "react";
import { SocialLink } from "@/lib/api/links";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcon";

interface SocialIconsProps {
  socialLinks: SocialLink[];
}

export function SocialIcons({ socialLinks }: SocialIconsProps) {
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-4">
      <div className="flex items-center justify-center gap-3">
        {socialLinks.map((social) => (
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
