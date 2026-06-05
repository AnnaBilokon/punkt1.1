import { useQuery } from '@tanstack/react-query';

import { shelfService } from '@/services/shelves/shelfService';
import { useAuthStore } from '@/store/authStore';
import { shelfBooksQueryKey } from '@/store/shelfStore';

export const useShelfBooks = (shelfId: string | null) => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    enabled: Boolean(shelfId) && Boolean(userId),
    queryFn: () => shelfService.getShelfBooks(shelfId!, userId!),
    queryKey: shelfBooksQueryKey(shelfId ?? ''),
    staleTime: 1000 * 30,
  });
};
