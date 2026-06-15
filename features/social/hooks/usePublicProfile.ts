import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const publicProfileQueryKey = (userId: string | null) =>
  ['public-profile', userId] as const;

export const usePublicProfile = (userId: string | null) =>
  useQuery({
    queryKey: publicProfileQueryKey(userId),
    queryFn: () => socialService.getPublicProfile(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });

export const useUserPublicBooks = (userId: string | null) =>
  useQuery({
    queryKey: ['user-public-books', userId],
    queryFn: () => socialService.getUserBooks(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
