import { useColorScheme } from 'react-native';

import { getColors, type ThemeMode } from '@/theme';

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return {
    colors: getColors(mode),
    isDark: mode === 'dark',
    mode,
  };
};
