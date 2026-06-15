import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const followingQueryKey = (userId: string | null) =>
  ['following', userId] as const;

export const useFollowing = (userId: string | null) =>
  useQuery({
    queryKey: followingQueryKey(userId),
    queryFn: () => socialService.getFollowing(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
