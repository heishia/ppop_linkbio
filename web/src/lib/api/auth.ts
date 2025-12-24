import { apiClient } from "./client";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
  user: User;
}

// 버튼 스타일 타입
export type ButtonStyle = "default" | "outline" | "filled";

export interface User {
  id: string;
  user_seq: number | null;              // 순차 번호 (링크 ID 생성용)
  public_link_id: string | null;        // 암호화된 공개 링크 ID
  username: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  background_image_url: string | null;
  background_color: string | null;
  theme: string;
  button_style: ButtonStyle;            // 링크 버튼 스타일
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      data
    );
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      data
    );
    return response.data;
  },

  getMe: async (): Promise<{ data: User }> => {
    const response = await apiClient.get<{ data: User }>("/api/auth/me");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ data: { access_token: string; refresh_token: string } }> => {
    const response = await apiClient.post("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
