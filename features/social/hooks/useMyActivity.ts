import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const myActivityQueryKey = (userId: string | null) =>
  ['my-activity', userId] as const;

export const useMyActivity = (userId: string | null) =>
  useQuery({
    queryKey: myActivityQueryKey(userId),
    queryFn: () => socialService.getMyActivity(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
