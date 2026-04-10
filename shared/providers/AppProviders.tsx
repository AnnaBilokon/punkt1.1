import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { queryClient } from '@/shared/lib/queryClient';
import { useAuthStore } from '@/store/authStore';

const rootViewStyle = { flex: 1 };

export const AppProviders = ({ children }: PropsWithChildren) => {
  const { colors, isDark } = useAppTheme();
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return (
    <GestureHandlerRootView style={rootViewStyle}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          {children}
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};
