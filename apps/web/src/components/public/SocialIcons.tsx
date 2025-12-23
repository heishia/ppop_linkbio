import React from "react";
import { SocialLink } from "@/lib/api/links";
import { Chip } from "@/components/ui/Chip";

interface SocialIconsProps {
  socialLinks: SocialLink[];
}

export function SocialIcons({ socialLinks }: SocialIconsProps) {
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-4">
      <div className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth">
        {socialLinks.map((social) => (
          <button
            key={social.id}
            onClick={() => handleSocialClick(social.url)}
            className="transition-transform hover:scale-105"
          >
            <Chip label={social.platform} />
          </button>
        ))}
      </div>
    </section>
  );
}

