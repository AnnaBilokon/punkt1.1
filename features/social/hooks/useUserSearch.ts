import { useQuery } from '@tanstack/react-query';

import { socialService } from '@/services/social/socialService';

export const useUserSearch = (query: string, currentUserId: string | null) =>
  useQuery({
    queryKey: ['user-search', query, currentUserId],
    queryFn: () => socialService.searchUsers(query, currentUserId!),
    enabled: !!currentUserId && query.trim().length >= 2,
    staleTime: 30_000,
  });
