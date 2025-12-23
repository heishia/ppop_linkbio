import { apiClient } from "./client";

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LinkCreateData {
  title: string;
  url: string;
  thumbnail_url?: string;
}

export interface LinkUpdateData {
  title?: string;
  url?: string;
  thumbnail_url?: string;
  is_active?: boolean;
}

export interface SocialLinkCreateData {
  platform: string;
  url: string;
}

export interface SocialLinkUpdateData {
  url?: string;
  is_active?: boolean;
}

export const linksApi = {
  // Links
  getLinks: async (): Promise<{ data: Link[] }> => {
    const response = await apiClient.get<{ data: Link[] }>("/api/links");
    return response.data;
  },

  createLink: async (data: LinkCreateData): Promise<{ data: Link }> => {
    const response = await apiClient.post<{ data: Link }>("/api/links", data);
    return response.data;
  },

  updateLink: async (
    linkId: string,
    data: LinkUpdateData
  ): Promise<{ data: Link }> => {
    const response = await apiClient.put<{ data: Link }>(
      `/api/links/${linkId}`,
      data
    );
    return response.data;
  },

  deleteLink: async (linkId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/links/${linkId}`
    );
    return response.data;
  },

  reorderLinks: async (linkIds: string[]): Promise<{ data: Link[] }> => {
    const response = await apiClient.put<{ data: Link[] }>(
      "/api/links/reorder",
      {
        link_ids: linkIds,
      }
    );
    return response.data;
  },

  // Social Links
  getSocialLinks: async (): Promise<{ data: SocialLink[] }> => {
    const response = await apiClient.get<{ data: SocialLink[] }>(
      "/api/links/social"
    );
    return response.data;
  },

  createSocialLink: async (
    data: SocialLinkCreateData
  ): Promise<{ data: SocialLink }> => {
    const response = await apiClient.post<{ data: SocialLink }>(
      "/api/links/social",
      data
    );
    return response.data;
  },

  updateSocialLink: async (
    socialLinkId: string,
    data: SocialLinkUpdateData
  ): Promise<{ data: SocialLink }> => {
    const response = await apiClient.put<{ data: SocialLink }>(
      `/api/links/social/${socialLinkId}`,
      data
    );
    return response.data;
  },

  deleteSocialLink: async (socialLinkId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/links/social/${socialLinkId}`
    );
    return response.data;
  },
};

