import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const friendActivityQueryKey = (userId: string | null) =>
  ['friend-activity', userId] as const;

export const useFriendActivity = (userId: string | null) =>
  useQuery({
    queryKey: friendActivityQueryKey(userId),
    queryFn: () => socialService.getFriendActivity(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
