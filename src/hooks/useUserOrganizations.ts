import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { TokenResponse, UserOrganizationItem } from '@/types/api';

/** Organizations the current user belongs to, and switching the session between them. */
export function useUserOrganizations() {
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['auth', 'organizations'],
    queryFn: async () => {
      const response = await apiClient.get<UserOrganizationItem[]>('/auth/organizations');
      return response.data;
    },
    enabled: !!localStorage.getItem('access_token'),
  });

  const switchMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await apiClient.post<TokenResponse>('/auth/switch-organization', {
        organization_id: organizationId,
        refresh_token: localStorage.getItem('refresh_token'),
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      // Everything on screen belongs to the previous organization
      queryClient.clear();
    },
  });

  return {
    organizations,
    isLoading,
    switchOrganization: switchMutation.mutateAsync,
    isSwitching: switchMutation.isPending,
  };
}
