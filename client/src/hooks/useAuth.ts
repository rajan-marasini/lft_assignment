import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/use-auth-store";
import type { LoginPayload, RegisterPayload, ResendVerificationPayload } from "@/types/auth.types";

export const AUTH_QUERY_KEY = ["auth", "me"];

export const useCurrentUser = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getMe,
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Welcome back! Login successful.");
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage =
        error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      toast.success(
        data.message || "Registration successful! Please check your email to verify your account."
      );
      navigate("/login?unverified=true");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useVerifyEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      toast.success(data.message || "Email verified successfully! You can now log in.");
      navigate("/login?verified=true");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage =
        error.response?.data?.message || "Verification failed or token expired.";
      toast.error(errorMessage);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (payload: ResendVerificationPayload) => authApi.resendVerification(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Verification email sent. Please check your inbox.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to resend verification email.";
      toast.error(errorMessage);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.info("Logged out successfully");
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      navigate("/login");
    },
    onError: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      navigate("/login");
    },
  });
};
