import { useQuery } from '@tanstack/react-query';

import { profileService } from '@/services/profile/profileService';
import { profileQueryKey } from '@/store/profileStore';

export const useProfile = (userId: string | null) =>
  useQuery({
    enabled: Boolean(userId),
    queryFn: () => profileService.getProfile(userId!),
    queryKey: profileQueryKey(userId ?? ''),
    staleTime: 60_000,
  });
