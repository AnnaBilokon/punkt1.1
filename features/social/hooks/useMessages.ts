import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { messagingService } from '@/services/social/messagingService';
import { conversationsQueryKey } from './useConversations';

export const conversationIdQueryKey = (userId: string | null, otherId: string | null) =>
  ['conversation-id', userId, otherId] as const;

export const messagesQueryKey = (conversationId: string | null) =>
  ['messages', conversationId] as const;

export const useConversationId = (userId: string | null, otherUserId: string | null) =>
  useQuery({
    queryKey: conversationIdQueryKey(userId, otherUserId),
    queryFn: () => messagingService.getOrCreateConversation(userId!, otherUserId!),
    enabled: !!userId && !!otherUserId && userId !== otherUserId,
    staleTime: Infinity,
  });

export const useMessages = (conversationId: string | null) =>
  useQuery({
    queryKey: messagesQueryKey(conversationId),
    queryFn: () => messagingService.getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 3_000,
    refetchInterval: 5_000,
  });

export const useSendMessage = (conversationId: string | null, userId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      messagingService.sendMessage(conversationId!, userId!, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messagesQueryKey(conversationId) });
      void queryClient.invalidateQueries({ queryKey: conversationsQueryKey(userId) });
    },
  });
};
