import { useLocalSearchParams } from 'expo-router';

import { useAllShelves } from '@/features/library/hooks/useCustomShelves';
import { CustomShelfScreen } from '@/features/library/screens/CustomShelfScreen';
import { useAuthStore } from '@/store/authStore';

export default function CustomShelfRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: shelves } = useAllShelves(userId);
  const shelf = shelves.find((s) => s.id === id);

  if (!shelf) return null;

  return <CustomShelfScreen shelf={shelf} />;
}
