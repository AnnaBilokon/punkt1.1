import { useQuery } from '@tanstack/react-query';

import { streakService } from '@/services/profile/streakService';

export const streakQueryKey = (userId: string | null) => ['streak', userId] as const;

export const useStreak = (userId: string | null) =>
  useQuery({
    queryKey: streakQueryKey(userId),
    queryFn: () => streakService.getStreak(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
