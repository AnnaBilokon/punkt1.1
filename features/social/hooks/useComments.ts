import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const commentsQueryKey = (activityUserId: string, bookApiId: string) =>
  ['comments', activityUserId, bookApiId] as const;

export const useComments = (activityUserId: string, bookApiId: string, enabled = true) =>
  useQuery({
    queryKey: commentsQueryKey(activityUserId, bookApiId),
    queryFn: () => socialService.getComments(activityUserId, bookApiId),
    staleTime: 30_000,
    enabled: enabled && !!activityUserId && !!bookApiId,
  });

export const useAddComment = (activityUserId: string, bookApiId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, text }: { userId: string; text: string }) =>
      socialService.addComment(userId, activityUserId, bookApiId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(activityUserId, bookApiId) });
      void queryClient.invalidateQueries({ queryKey: ['friend-activity'] });
    },
  });
};

export const useDeleteComment = (activityUserId: string, bookApiId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => socialService.deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(activityUserId, bookApiId) });
      void queryClient.invalidateQueries({ queryKey: ['friend-activity'] });
    },
  });
};
