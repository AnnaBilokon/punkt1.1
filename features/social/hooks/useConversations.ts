import { useQuery } from '@tanstack/react-query';

import { messagingService } from '@/services/social/messagingService';

export const conversationsQueryKey = (userId: string | null) =>
  ['conversations', userId] as const;

export const useConversations = (userId: string | null) =>
  useQuery({
    queryKey: conversationsQueryKey(userId),
    queryFn: () => messagingService.getConversations(userId!),
    enabled: !!userId,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
