import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { MemberResponse, InviteMemberRequest, ChangeRoleRequest, InviteResponse } from '@/types/api';

export function useMembers() {
  const queryClient = useQueryClient();

  // List members
  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await apiClient.get<MemberResponse[]>('/organizations/members');
      return response.data;
    },
  });

  // Invite member - returns invite URL to share
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteMemberRequest) => {
      const response = await apiClient.post<InviteResponse>(
        '/organizations/members/invite',
        data
      );
      return response.data;
    },
    // Note: Don't invalidate members - user is not added until they accept
  });

  // Change role
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: ChangeRoleRequest }) => {
      const response = await apiClient.put<MemberResponse>(
        `/organizations/members/${userId}/role`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  // Remove member
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/organizations/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    members,
    isLoading,
    error,
    inviteMember: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error,
    changeRole: changeRoleMutation.mutateAsync,
    isChangingRole: changeRoleMutation.isPending,
    changeRoleError: changeRoleMutation.error,
    removeMember: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    removeError: removeMutation.error,
  };
}