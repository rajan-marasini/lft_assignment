import { apiClient } from "./axios";
import { useAuthStore } from "@/stores/use-auth-store";
import type {
  ApiResponse,
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  ResendVerificationPayload,
  User,
} from "@/types/auth.types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload
    );
    const token = response.data.data?.accessToken;
    if (token) {
      useAuthStore.getState().setAccessToken(token);
    }
    if (response.data.data?.user) {
      useAuthStore.getState().setUser(response.data.data.user);
    }
    return response.data;
  },

  register: async (
    payload: RegisterPayload
  ): Promise<ApiResponse<AuthResponseData>> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.get<ApiResponse<void>>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  resendVerification: async (payload: ResendVerificationPayload): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>("/auth/resend-verification", payload);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>("/auth/logout");
      return response.data;
    } finally {
      useAuthStore.getState().logout();
    }
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
    if (!response.data.data?.user) {
      throw new Error("User data not found");
    }
    useAuthStore.getState().setUser(response.data.data.user);
    return response.data.data.user;
  },
};
