import { create } from "zustand";
import { profileApi } from "@/lib/api/profile";
import { User, ButtonStyle } from "@/lib/api/auth";

interface ProfileState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: {
    display_name?: string;
    bio?: string;
    background_color?: string;
    button_style?: ButtonStyle;
  }) => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  uploadBackgroundImage: (file: File) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getProfile();
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.updateProfile(data);
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  updateTheme: async (theme) => {
    try {
      const response = await profileApi.updateTheme({ theme });
      set({ profile: response.data });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to update theme",
      });
      throw error;
    }
  },

  uploadProfileImage: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.uploadProfileImage(file);
      // Update profile with new image URL
      set((state) => ({
        profile: state.profile
          ? { ...state.profile, profile_image_url: response.url }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to upload image",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadBackgroundImage: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.uploadBackgroundImage(file);
      // Update profile with new background URL
      set((state) => ({
        profile: state.profile
          ? { ...state.profile, background_image_url: response.url }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to upload background",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

