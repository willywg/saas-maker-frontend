import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { OrganizationResponse, OrganizationUpdate } from '@/types/api';

export function useOrganization() {
  const queryClient = useQueryClient();

  // Get organization
  const {
    data: organization,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const response = await apiClient.get<OrganizationResponse>('/organizations/me');
      return response.data;
    },
  });

  // Update organization
  const updateMutation = useMutation({
    mutationFn: async (data: OrganizationUpdate) => {
      const response = await apiClient.put<OrganizationResponse>('/organizations/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      // Also invalidate auth to update organization_name in user
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  return {
    organization,
    isLoading,
    error,
    updateOrganization: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}