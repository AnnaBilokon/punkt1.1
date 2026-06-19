import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const notificationsQueryKey = (userId: string | null) =>
  ['notifications', userId] as const;

export const useNotifications = (userId: string | null) =>
  useQuery({
    queryKey: notificationsQueryKey(userId),
    queryFn: () => socialService.getNotifications(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
