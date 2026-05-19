import '../global.css';

import { Stack } from 'expo-router';

import { AppProviders } from '@/shared/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book/[id]" />
        <Stack.Screen name="challenge" />
        <Stack.Screen name="genres" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="help" />
      </Stack>
    </AppProviders>
  );
}
