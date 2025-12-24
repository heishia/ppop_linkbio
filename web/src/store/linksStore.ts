import { create } from "zustand";
import { linksApi, Link, SocialLink } from "@/lib/api/links";

// API 에러를 문자열로 변환하는 헬퍼 함수
function parseApiError(error: any, fallbackMessage: string): string {
  const detail = error.response?.data?.detail;
  if (!detail) return fallbackMessage;

  // 문자열인 경우 그대로 반환
  if (typeof detail === "string") return detail;

  // 배열인 경우 (Pydantic validation error)
  if (Array.isArray(detail)) {
    // msg 필드들을 추출하여 하나의 문자열로 합침
    const messages = detail
      .map((err: { msg?: string }) => err.msg)
      .filter(Boolean);
    return messages.length > 0 ? messages.join(", ") : fallbackMessage;
  }

  // 객체인 경우 msg 필드가 있으면 사용
  if (typeof detail === "object" && detail.msg) {
    return detail.msg;
  }

  return fallbackMessage;
}

interface LinksState {
  links: Link[];
  socialLinks: SocialLink[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLinks: () => Promise<void>;
  fetchSocialLinks: () => Promise<void>;
  createLink: (data: { title: string; url: string }) => Promise<void>;
  updateLink: (
    linkId: string,
    data: { title?: string; url?: string; is_active?: boolean }
  ) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
  reorderLinks: (linkIds: string[]) => Promise<void>;
  createSocialLink: (data: { platform: string; url: string }) => Promise<void>;
  updateSocialLink: (
    socialLinkId: string,
    data: { url?: string; is_active?: boolean }
  ) => Promise<void>;
  deleteSocialLink: (socialLinkId: string) => Promise<void>;
  clearError: () => void;
}

export const useLinksStore = create<LinksState>((set) => ({
  links: [],
  socialLinks: [],
  isLoading: false,
  error: null,

  fetchLinks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await linksApi.getLinks();
      set({ links: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to fetch links"),
        isLoading: false,
      });
    }
  },

  fetchSocialLinks: async () => {
    try {
      const response = await linksApi.getSocialLinks();
      set({ socialLinks: response.data });
    } catch (error: any) {
      console.error("Failed to fetch social links:", error);
    }
  },

  createLink: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await linksApi.createLink(data);
      set((state) => ({
        links: [...state.links, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to create link"),
        isLoading: false,
      });
      throw error;
    }
  },

  updateLink: async (linkId, data) => {
    try {
      const response = await linksApi.updateLink(linkId, data);
      set((state) => ({
        links: state.links.map((link) =>
          link.id === linkId ? response.data : link
        ),
      }));
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to update link"),
      });
      throw error;
    }
  },

  deleteLink: async (linkId) => {
    try {
      await linksApi.deleteLink(linkId);
      set((state) => ({
        links: state.links.filter((link) => link.id !== linkId),
      }));
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to delete link"),
      });
      throw error;
    }
  },

  reorderLinks: async (linkIds) => {
    try {
      const response = await linksApi.reorderLinks(linkIds);
      set({ links: response.data });
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to reorder links"),
      });
      throw error;
    }
  },

  createSocialLink: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await linksApi.createSocialLink(data);
      set((state) => ({
        socialLinks: [...state.socialLinks, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to create social link"),
        isLoading: false,
      });
      throw error;
    }
  },

  updateSocialLink: async (socialLinkId, data) => {
    try {
      const response = await linksApi.updateSocialLink(socialLinkId, data);
      set((state) => ({
        socialLinks: state.socialLinks.map((link) =>
          link.id === socialLinkId ? response.data : link
        ),
      }));
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to update social link"),
      });
      throw error;
    }
  },

  deleteSocialLink: async (socialLinkId) => {
    try {
      await linksApi.deleteSocialLink(socialLinkId);
      set((state) => ({
        socialLinks: state.socialLinks.filter(
          (link) => link.id !== socialLinkId
        ),
      }));
    } catch (error: any) {
      set({
        error: parseApiError(error, "Failed to delete social link"),
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
