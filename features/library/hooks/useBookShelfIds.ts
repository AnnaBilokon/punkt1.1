import { useQuery } from '@tanstack/react-query';

import { shelfService } from '@/services/shelves/shelfService';
import { bookShelfIdsQueryKey } from '@/store/shelfStore';

export const useBookShelfIds = (
  bookApiId: string | null,
  userId: string | null,
) =>
  useQuery({
    enabled: Boolean(bookApiId) && Boolean(userId),
    queryFn: () => shelfService.getBookShelfIds(bookApiId!, userId!),
    queryKey: bookShelfIdsQueryKey(bookApiId ?? '', userId ?? ''),
    staleTime: 1000 * 30,
  });
