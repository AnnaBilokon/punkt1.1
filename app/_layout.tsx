import '../global.css';

import { Slot } from 'expo-router';

import { AppProviders } from '@/shared/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
