import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  ProjectCreate,
  ProjectListParams,
  ProjectListResponse,
  ProjectResponse,
  ProjectUpdate,
} from '@/types/api';

/**
 * Projects: reference tenant-scoped resource.
 * The backend scopes everything to the session's organization, so the
 * query key only needs the list params. Switching organization clears
 * the whole cache (see useUserOrganizations), which refetches this.
 */
export function useProjects(params: ProjectListParams = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await apiClient.get<ProjectListResponse>('/projects', { params });
      return response.data;
    },
    placeholderData: (previous) => previous,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] });

  const createMutation = useMutation({
    mutationFn: async (payload: ProjectCreate) => {
      const response = await apiClient.post<ProjectResponse>('/projects', payload);
      return response.data;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }) => {
      const response = await apiClient.put<ProjectResponse>(`/projects/${id}`, data);
      return response.data;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/projects/${id}`);
    },
    onSuccess: invalidate,
  });

  return {
    projects: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? params.page ?? 1,
    pageSize: data?.page_size ?? params.page_size ?? 20,
    isLoading,
    error,
    refetch,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
