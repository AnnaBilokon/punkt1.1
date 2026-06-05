import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const _hasHydrated = useAppStore((s) => s._hasHydrated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  if (!isInitialized || !_hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: '#fdfdfd' }} />;
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (!onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/home" />;
}
