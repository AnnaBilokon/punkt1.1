import { useQuery } from '@tanstack/react-query';

import { shelfService } from '@/services/shelves/shelfService';
import { customShelvesQueryKey } from '@/store/shelfStore';

export const useCustomShelves = (userId: string | null) =>
  useQuery({
    enabled: Boolean(userId),
    queryFn: () => shelfService.getCustomShelves(userId!),
    queryKey: customShelvesQueryKey(userId ?? ''),
    staleTime: 1000 * 30,
  });
