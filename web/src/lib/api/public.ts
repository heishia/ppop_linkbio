import axios from "axios";
import { apiClient } from "./client";
import { Link, SocialLink } from "./links";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PublicProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  background_image_url: string | null;
  background_color: string | null;
  theme: string;
  links: Link[];
  social_links: SocialLink[];
}

export const publicApi = {
  getPublicProfile: async (username: string): Promise<{ data: PublicProfile }> => {
    // Use axios directly for SSR (no auth needed for public profiles)
    const response = await axios.get<{ data: PublicProfile }>(
      `${API_URL}/api/public/${username}`
    );
    return response.data;
  },

  recordClick: async (username: string, linkId: string): Promise<void> => {
    await apiClient.post(`/api/public/${username}/click/${linkId}`);
  },
};

