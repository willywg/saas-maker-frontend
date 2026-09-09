import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import apiClient from '@/lib/api-client';
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
  UserResponse,
  TokenResponse,
} from '@/types/api';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<UserResponse>('/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation - uses form-data (application/x-www-form-urlencoded)
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Backend expects form-data with 'username' field (not 'email')
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      const response = await apiClient.post<TokenResponse>('/auth/login', formData);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/dashboard');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<TokenResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/dashboard');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await apiClient.post<MessageResponse>('/auth/forgot-password', data);
      return response.data;
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await apiClient.post<MessageResponse>('/auth/reset-password', data);
      return response.data;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.put<UserResponse>('/auth/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  // Change password mutation (keeps this session, revokes the others)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await apiClient.post<MessageResponse>('/auth/change-password', {
        ...data,
        refresh_token: localStorage.getItem('refresh_token'),
      });
      return response.data;
    },
  });

  // Email verification
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailRequest) => {
      const response = await apiClient.post<MessageResponse>('/auth/verify-email', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<MessageResponse>('/auth/resend-verification');
      return response.data;
    },
  });

  // Logout: revoke the refresh token server-side (best effort), then clear local state
  const clearSession = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    queryClient.clear();
    navigate('/login');
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      apiClient.post('/auth/logout', { refresh_token: refreshToken }).catch(() => undefined);
    }
    clearSession();
  };

  // Logout everywhere: revoke every session of this user, then clear local state
  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<MessageResponse>('/auth/logout-all');
      return response.data;
    },
    onSuccess: clearSession,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingReset: forgotPasswordMutation.isPending,
    forgotPasswordSuccess: forgotPasswordMutation.isSuccess,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isVerifyingEmail: verifyEmailMutation.isPending,
    resendVerification: resendVerificationMutation.mutateAsync,
    isResendingVerification: resendVerificationMutation.isPending,
    logout,
    logoutAll: logoutAllMutation.mutateAsync,
    isLoggingOutAll: logoutAllMutation.isPending,
  };
}
