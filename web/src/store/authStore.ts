import { create } from "zustand";
import { authApi, User, RegisterData, LoginData } from "@/lib/api/auth";

// API 에러를 문자열로 변환하는 헬퍼 함수
function parseApiError(error: unknown, fallbackMessage: string): string {
  const axiosError = error as { response?: { data?: { detail?: unknown } } };
  const detail = axiosError.response?.data?.detail;
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
  if (typeof detail === "object" && detail !== null && "msg" in detail) {
    return String((detail as { msg: unknown }).msg);
  }

  return fallbackMessage;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(data);
      const { access_token, refresh_token } = response.data;
      const { user } = response;

      // Store tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: parseApiError(error, "Login failed. Please try again."),
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { access_token, refresh_token } = response.data;
      const { user } = response;

      // Store tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: parseApiError(error, "Registration failed. Please try again."),
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
