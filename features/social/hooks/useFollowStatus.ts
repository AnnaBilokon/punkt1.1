import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const followStatusQueryKey = (
  currentUserId: string | null,
  targetUserId: string | null,
) => ['follow-status', currentUserId, targetUserId] as const;

export const useFollowStatus = (
  currentUserId: string | null,
  targetUserId: string | null,
) =>
  useQuery({
    queryKey: followStatusQueryKey(currentUserId, targetUserId),
    queryFn: () => socialService.isFollowing(currentUserId!, targetUserId!),
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 30_000,
  });
