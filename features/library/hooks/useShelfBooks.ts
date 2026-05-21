import { useQuery } from '@tanstack/react-query';

import { shelfService } from '@/services/shelves/shelfService';
import { shelfBooksQueryKey } from '@/store/shelfStore';
import { useAuthStore } from '@/store/authStore';

export const useShelfBooks = (shelfId: string | null) => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    enabled: Boolean(shelfId) && Boolean(userId),
    queryFn: () => shelfService.getShelfBooks(shelfId!, userId!),
    queryKey: shelfBooksQueryKey(shelfId ?? ''),
    staleTime: 1000 * 30,
  });
};
