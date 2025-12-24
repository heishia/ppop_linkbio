import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  profile: Profile;
  className?: string;
}

export function ProfileSection({ profile, className }: ProfileSectionProps) {
  return (
    <section className={cn("flex flex-col items-center py-8", className)}>
      <Avatar src={profile.avatarUrl} alt={profile.username} />
      <h1 className="mt-4 text-center font-extrabold text-username">
        {profile.username}
      </h1>
      <p className="mt-2 text-center font-normal text-bio whitespace-pre-line">{profile.bio}</p>
    </section>
  );
}

