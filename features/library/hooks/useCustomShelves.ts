import { useQuery } from '@tanstack/react-query';

import { shelfService } from '@/services/shelves/shelfService';
import { archivedShelvesQueryKey, customShelvesQueryKey } from '@/store/shelfStore';

export const useCustomShelves = (userId: string | null) =>
  useQuery({
    enabled: Boolean(userId),
    queryFn: () => shelfService.getCustomShelves(userId!),
    queryKey: customShelvesQueryKey(userId ?? ''),
    staleTime: 1000 * 30,
  });

export const useArchivedShelves = (userId: string | null) =>
  useQuery({
    enabled: Boolean(userId),
    queryFn: () => shelfService.getArchivedShelves(userId!),
    queryKey: archivedShelvesQueryKey(userId ?? ''),
    staleTime: 1000 * 30,
  });

export const useAllShelves = (userId: string | null) => {
  const active = useCustomShelves(userId);
  const archived = useArchivedShelves(userId);
  return {
    data: [...(active.data ?? []), ...(archived.data ?? [])],
    isFetching: active.isFetching || archived.isFetching,
  };
};
