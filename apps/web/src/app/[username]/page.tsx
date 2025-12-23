import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api/public";
import { PublicProfileClient } from "@/components/public/PublicProfileClient";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const username = params.username.startsWith("@")
    ? params.username.slice(1)
    : params.username;

  try {
    const { data: profile } = await publicApi.getPublicProfile(username);

    return <PublicProfileClient profile={profile} />;
  } catch (error: any) {
    if (error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const username = params.username.startsWith("@")
    ? params.username.slice(1)
    : params.username;

  try {
    const { data: profile } = await publicApi.getPublicProfile(username);

    return {
      title: `${profile.display_name || profile.username} | PPOP LinkBio`,
      description: profile.bio || `Check out ${profile.username}'s links`,
      openGraph: {
        title: profile.display_name || profile.username,
        description: profile.bio || `Check out ${profile.username}'s links`,
        images: profile.profile_image_url
          ? [profile.profile_image_url]
          : undefined,
      },
    };
  } catch (error) {
    return {
      title: "Profile Not Found | PPOP LinkBio",
    };
  }
}

