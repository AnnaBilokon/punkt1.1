import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) return <View style={{ flex: 1, backgroundColor: '#fdfdfd' }} />;

  return (
    <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/welcome'} />
  );
}
