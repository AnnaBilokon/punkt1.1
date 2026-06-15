import { useLocalSearchParams } from 'expo-router';

import { UserProfileScreen } from '@/features/social/screens/UserProfileScreen';

export default function UserProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserProfileScreen userId={id} />;
}
