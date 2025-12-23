import { create } from "zustand";
import { linksApi, Link, SocialLink } from "@/lib/api/links";

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
  clearError: () => void;
}

export const useLinksStore = create<LinksState>((set, get) => ({
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
        error: error.response?.data?.detail || "Failed to fetch links",
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
        error: error.response?.data?.detail || "Failed to create link",
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
        error: error.response?.data?.detail || "Failed to update link",
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
        error: error.response?.data?.detail || "Failed to delete link",
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
        error: error.response?.data?.detail || "Failed to reorder links",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

