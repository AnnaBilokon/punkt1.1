import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const followersQueryKey = (userId: string | null) =>
  ['followers', userId] as const;

export const useFollowers = (userId: string | null) =>
  useQuery({
    queryKey: followersQueryKey(userId),
    queryFn: () => socialService.getFollowers(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
